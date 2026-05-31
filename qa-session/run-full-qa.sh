#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8787"
FIX="/workspace/qa-session/fixtures"
OUT="/workspace/qa-session/results"
A="$FIX/a.mp4"
B="$FIX/b.mp4"
C="$FIX/c.mp4"
EIGHT="$FIX/eight.mp4"
mkdir -p "$OUT"
: > "$OUT/summary.tsv"

api_post() { curl -sS -X POST "$BASE$1" "${@:2}"; }
dl() { curl -sS -o "$2" "$BASE$1"; }

nonzero() { [[ -f "$1" ]] && [[ "$(stat -c%s "$1")" -gt 0 ]]; }
jpeg_ok() { nonzero "$1" && file "$1" | grep -qi jpeg && [[ "$(stat -c%s "$1")" -gt 200 ]]; }
mp4_ok() { nonzero "$1" && ffprobe -v error "$1" >/dev/null 2>&1; }

# Parse last VTT timestamp on a line (HH:MM:SS.mmm)
vtt_max_time() {
  python3 - "$1" <<'PY'
import re, sys
path = sys.argv[1]
text = open(path).read()
times = []
for line in text.splitlines():
    for m in re.finditer(r'(\d{2}):(\d{2}):(\d{2}\.\d{3})', line):
        h, mi, s = m.groups()
        times.append(int(h)*3600 + int(mi)*60 + float(s))
print(max(times) if times else 0)
PY
}

vtt_cues_in_duration() {
  local vtt="$1" dur="$2"
  local maxt
  maxt=$(vtt_max_time "$vtt")
  python3 - "$maxt" "$dur" <<'PY'
import sys
maxt, dur = float(sys.argv[1]), float(sys.argv[2])
# allow 50ms tolerance for probe vs VTT rounding
sys.exit(0 if maxt <= dur + 0.05 else 1)
PY
}

record() { echo "$1|$2|$3" >> "$OUT/summary.tsv"; echo "TEST $1: $2"; }

# --- tests ---
# 1 concat reencode:false
resp=$(api_post /v1/concat -F "files=@$A" -F "files=@$B" -F 'payload={"reencode":false}')
echo "$resp" > "$OUT/t1.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t1_concat.mp4"
  mp4_ok "$OUT/t1_concat.mp4" && dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/t1_concat.mp4") && \
  python3 - "$dur" <<'PY' && record 1 PASS "concat 2 reencode:false" || record 1 FAIL "concat 2 reencode:false (artifact)"
import sys
d=float(sys.argv[1])
sys.exit(0 if 7.5 < d < 8.5 else 1)  # ~8s
PY
else record 1 FAIL "concat 2 reencode:false (api)"; fi

# 2 concat reencode:true
resp=$(api_post /v1/concat -F "files=@$A" -F "files=@$B" -F 'payload={"reencode":true}')
echo "$resp" > "$OUT/t2.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t2_concat.mp4"
  if mp4_ok "$OUT/t2_concat.mp4" && ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$OUT/t2_concat.mp4" | grep -q h264; then
    record 2 PASS "concat 2 reencode:true"
  else record 2 FAIL "concat 2 reencode:true (artifact/codec)"; fi
else record 2 FAIL "concat 2 reencode:true (api)"; fi

# 3 concat 3 files
resp=$(api_post /v1/concat -F "files=@$A" -F "files=@$B" -F "files=@$C" -F 'payload={"reencode":false}')
echo "$resp" > "$OUT/t3.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t3_concat.mp4"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/t3_concat.mp4" 2>/dev/null || echo 0)
  python3 - "$dur" <<'PY' && record 3 PASS "concat 3 files" || record 3 FAIL "concat 3 files (duration)"
import sys
d=float(sys.argv[1])
sys.exit(0 if 9.5 < d < 10.5 else 1)
PY
else record 3 FAIL "concat 3 files (api)"; fi

# 4 thumbnails at
resp=$(api_post /v1/thumbnails -F "file=@$A" -F 'payload={"at":"00:00:01"}')
echo "$resp" > "$OUT/t4.json"
if echo "$resp" | jq -e '.ok==true and (.artifacts|length)>=1' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t4_at.jpg"
  jpeg_ok "$OUT/t4_at.jpg" && record 4 PASS 'thumbnails {"at":"00:00:01"}' || record 4 FAIL 'thumbnails at (empty)'
else record 4 FAIL 'thumbnails at (api)'; fi

# 5 everyMs
resp=$(api_post /v1/thumbnails -F "file=@$A" -F 'payload={"everyMs":1000}')
echo "$resp" > "$OUT/t5.json"
n=$(echo "$resp" | jq -r '.artifacts|length' 2>/dev/null || echo 0)
ok=1
if echo "$resp" | jq -e '.ok==true' >/dev/null && [[ "$n" -ge 1 ]]; then
  i=0
  while read -r url; do
    i=$((i+1))
    dl "$url" "$OUT/t5_$i.jpg"
    jpeg_ok "$OUT/t5_$i.jpg" || ok=0
  done < <(echo "$resp" | jq -r '.artifacts[].url')
  [[ "$n" -ge 4 ]] || ok=0  # 5s video ~5 frames
else ok=0; fi
[[ $ok -eq 1 ]] && record 5 PASS 'thumbnails {"everyMs":1000}' || record 5 FAIL 'thumbnails everyMs'

# 6 sceneAware
resp=$(api_post /v1/thumbnails -F "file=@$A" -F 'payload={"sceneAware":true}')
echo "$resp" > "$OUT/t6.json"
if echo "$resp" | jq -e '.ok==true and (.artifacts|length)>=1' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t6_scene.jpg"
  sz=$(stat -c%s "$OUT/t6_scene.jpg" 2>/dev/null || echo 0)
  if jpeg_ok "$OUT/t6_scene.jpg" && [[ "$sz" -gt 500 ]]; then
    record 6 PASS 'thumbnails sceneAware (non-empty)'
  else record 6 FAIL "thumbnails sceneAware (size=$sz)"; fi
else record 6 FAIL 'thumbnails sceneAware (api)'; fi

# 7 combined
resp=$(api_post /v1/thumbnails -F "file=@$A" -F 'payload={"at":"00:00:01","everyMs":1000,"sceneAware":true}')
echo "$resp" > "$OUT/t7.json"
cnt=$(echo "$resp" | jq -r '.artifacts|length' 2>/dev/null || echo 0)
ok=1
if echo "$resp" | jq -e '.ok==true' >/dev/null && [[ "$cnt" -ge 3 ]]; then
  i=0
  while read -r url; do
    i=$((i+1))
    dl "$url" "$OUT/t7_$i.jpg"
    jpeg_ok "$OUT/t7_$i.jpg" || ok=0
  done < <(echo "$resp" | jq -r '.artifacts[].url')
else ok=0; fi
[[ $ok -eq 1 ]] && record 7 PASS 'thumbnails at+everyMs+sceneAware' || record 7 FAIL 'thumbnails combined'

# 8 contactsheet 2x3 scale200
resp=$(api_post /v1/contactsheet -F "file=@$A" -F 'payload={"rows":2,"cols":3,"scale":200}')
echo "$resp" > "$OUT/t8.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t8_contact.jpg"
  jpeg_ok "$OUT/t8_contact.jpg" && record 8 PASS 'contactsheet 2x3 scale200' || record 8 FAIL 'contactsheet 2x3'
else record 8 FAIL 'contactsheet 2x3 (api)'; fi

# 9 contactsheet 4x4 scale320
resp=$(api_post /v1/contactsheet -F "file=@$A" -F 'payload={"rows":4,"cols":4,"scale":320}')
echo "$resp" > "$OUT/t9.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t9_contact.jpg"
  jpeg_ok "$OUT/t9_contact.jpg" && record 9 PASS 'contactsheet 4x4 scale320' || record 9 FAIL 'contactsheet 4x4'
else record 9 FAIL 'contactsheet 4x4 (api)'; fi

# 10 sprites 3x4 interval 1 on 5s video
dur_a=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
resp=$(api_post /v1/sprites -F "file=@$A" -F 'payload={"rows":3,"cols":4,"intervalSec":1}')
echo "$resp" > "$OUT/t10.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[]|select(.filename=="sprite.jpg")|.url')" "$OUT/t10_sprite.jpg"
  dl "$(echo "$resp" | jq -r '.artifacts[]|select(.filename=="sprite.vtt")|.url')" "$OUT/t10_sprite.vtt"
  cues=$(grep -c '#xywh=' "$OUT/t10_sprite.vtt" || true)
  if jpeg_ok "$OUT/t10_sprite.jpg" && vtt_cues_in_duration "$OUT/t10_sprite.vtt" "$dur_a" && [[ "$cues" -le 12 ]]; then
    record 10 PASS "sprites 3x4 intervalSec:1 (VTT in duration, cues=$cues)"
  else
    maxt=$(vtt_max_time "$OUT/t10_sprite.vtt")
    record 10 FAIL "sprites 3x4 VTT max=$maxt dur=$dur_a cues=$cues"
  fi
else record 10 FAIL 'sprites 3x4 (api)'; fi

# 11 sprites 10x10 interval 2 on 8s
dur8=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$EIGHT")
resp=$(api_post /v1/sprites -F "file=@$EIGHT" -F 'payload={"rows":10,"cols":10,"intervalSec":2}')
echo "$resp" > "$OUT/t11.json"
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[]|select(.filename=="sprite.jpg")|.url')" "$OUT/t11_sprite.jpg"
  dl "$(echo "$resp" | jq -r '.artifacts[]|select(.filename=="sprite.vtt")|.url')" "$OUT/t11_sprite.vtt"
  maxt=$(vtt_max_time "$OUT/t11_sprite.vtt")
  cues=$(grep -c '#xywh=' "$OUT/t11_sprite.vtt" || true)
  if jpeg_ok "$OUT/t11_sprite.jpg" && vtt_cues_in_duration "$OUT/t11_sprite.vtt" "$dur8"; then
    record 11 PASS "sprites 10x10 interval2 8s (max VTT $maxt <= $dur8, cues=$cues)"
  else
    record 11 FAIL "sprites 10x10 VTT exceeds duration max=$maxt dur=$dur8 cues=$cues"
  fi
else record 11 FAIL 'sprites 10x10 (api)'; fi

# 12 empty thumbnails {}
resp=$(api_post /v1/thumbnails -F "file=@$A" -F 'payload={}')
echo "$resp" > "$OUT/t12.json"
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE/v1/thumbnails" -F "file=@$A" -F 'payload={}')
# Re-use resp from first call; check behavior
if echo "$resp" | jq -e '.ok==true' >/dev/null; then
  dl "$(echo "$resp" | jq -r '.artifacts[0].url')" "$OUT/t12_default.jpg" 2>/dev/null || true
  if [[ -f "$OUT/t12_default.jpg" ]] && jpeg_ok "$OUT/t12_default.jpg"; then
    record 12 PASS 'empty thumbnails {} -> default frame at 0 (ok:true)'
  else
    record 12 FAIL 'empty thumbnails {} ok but bad artifact'
  fi
elif echo "$resp" | jq -e '.ok==false' >/dev/null; then
  err=$(echo "$resp" | jq -r '.error')
  record 12 PASS "empty thumbnails {} -> ok:false ($err)"
else
  record 12 FAIL "empty thumbnails {} unexpected: $resp"
fi

echo "=== ARTIFACT SIZES ==="
find "$OUT" -type f \( -name '*.jpg' -o -name '*.vtt' -o -name '*.mp4' \) -exec stat -c '%s %n' {} \; | sort -n

echo "=== SUMMARY ==="
column -t -s'|' "$OUT/summary.tsv" 2>/dev/null || cat "$OUT/summary.tsv"
