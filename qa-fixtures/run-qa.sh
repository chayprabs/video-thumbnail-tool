#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8787"
FIX="/workspace/qa-fixtures"
A="$FIX/test_a.mp4"
B="$FIX/test_b.mp4"
SINGLE="$A"
OUT="$FIX/results"
mkdir -p "$OUT"

api_post() {
  local endpoint="$1"
  shift
  curl -sS -X POST "$BASE$endpoint" "$@"
}

download_artifact() {
  local url="$1" dest="$2"
  curl -sS -o "$dest" "$BASE$url"
}

check_jpeg() {
  local f="$1"
  local sz
  sz=$(stat -c%s "$f" 2>/dev/null || echo 0)
  file "$f" | grep -q JPEG && [[ "$sz" -gt 500 ]]
}

check_mp4() {
  local f="$1"
  local sz
  sz=$(stat -c%s "$f" 2>/dev/null || echo 0)
  ffprobe -v error "$f" >/dev/null 2>&1 && [[ "$sz" -gt 1000 ]]
}

check_vtt_xywh() {
  local f="$1"
  local sz
  sz=$(stat -c%s "$f" 2>/dev/null || echo 0)
  [[ "$sz" -gt 20 ]] || return 1
  head -1 "$f" | grep -q '^WEBVTT' || return 1
  grep -q '#xywh=' "$f" || return 1
  grep -qE '[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3} -->' "$f" || return 1
}

run_test() {
  local num="$1" name="$2"
  shift 2
  echo "=== TEST $num: $name ==="
  if "$@"; then
    echo "RESULT: PASS"
    echo "$num|PASS|$name" >> "$OUT/summary.tsv"
  else
    echo "RESULT: FAIL"
    echo "$num|FAIL|$name" >> "$OUT/summary.tsv"
  fi
  echo
}

# Test 1: concat reencode:false
test1() {
  local resp
  resp=$(api_post /v1/concat \
    -F "files=@$A" -F "files=@$B" \
    -F 'payload={"reencode":false}')
  echo "$resp" | tee "$OUT/test1.json" | jq -e '.ok == true' >/dev/null
  local url job
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  job=$(echo "$resp" | jq -r '.jobId')
  download_artifact "$url" "$OUT/test1_concat.mp4"
  check_mp4 "$OUT/test1_concat.mp4"
}

# Test 2: concat reencode:true
test2() {
  local resp
  resp=$(api_post /v1/concat \
    -F "files=@$A" -F "files=@$B" \
    -F 'payload={"reencode":true}')
  echo "$resp" | tee "$OUT/test2.json" | jq -e '.ok == true' >/dev/null
  local url
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  download_artifact "$url" "$OUT/test2_concat.mp4"
  check_mp4 "$OUT/test2_concat.mp4"
  ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$OUT/test2_concat.mp4" | grep -q h264
}

# Test 3: thumbnails at
test3() {
  local resp
  resp=$(api_post /v1/thumbnails -F "file=@$SINGLE" -F 'payload={"at":"00:00:01"}')
  echo "$resp" | tee "$OUT/test3.json" | jq -e '.ok == true and (.artifacts | length) >= 1' >/dev/null
  local url
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  download_artifact "$url" "$OUT/test3_thumb.jpg"
  check_jpeg "$OUT/test3_thumb.jpg"
}

# Test 4: thumbnails everyMs
test4() {
  local resp
  resp=$(api_post /v1/thumbnails -F "file=@$SINGLE" -F 'payload={"everyMs":1000}')
  echo "$resp" | tee "$OUT/test4.json" | jq -e '.ok == true and (.artifacts | length) >= 1' >/dev/null
  local n=0
  while read -r url; do
    n=$((n+1))
    download_artifact "$url" "$OUT/test4_thumb_$n.jpg"
    check_jpeg "$OUT/test4_thumb_$n.jpg"
  done < <(echo "$resp" | jq -r '.artifacts[].url')
  [[ "$n" -ge 1 ]]
}

# Test 5: thumbnails sceneAware
test5() {
  local resp
  resp=$(api_post /v1/thumbnails -F "file=@$SINGLE" -F 'payload={"sceneAware":true}')
  echo "$resp" | tee "$OUT/test5.json" | jq -e '.ok == true and (.artifacts | length) >= 1' >/dev/null
  local url
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  download_artifact "$url" "$OUT/test5_scene.jpg"
  check_jpeg "$OUT/test5_scene.jpg"
}

# Test 6: thumbnails at + sceneAware
test6() {
  local resp
  resp=$(api_post /v1/thumbnails -F "file=@$SINGLE" \
    -F 'payload={"at":"00:00:01","sceneAware":true}')
  echo "$resp" | tee "$OUT/test6.json" | jq -e '.ok == true and (.artifacts | length) >= 2' >/dev/null
  local n=0
  while read -r url; do
    n=$((n+1))
    download_artifact "$url" "$OUT/test6_$n.jpg"
    check_jpeg "$OUT/test6_$n.jpg"
  done < <(echo "$resp" | jq -r '.artifacts[].url')
}

# Test 7: contactsheet 2x3 scale 200
test7() {
  local resp
  resp=$(api_post /v1/contactsheet -F "file=@$SINGLE" \
    -F 'payload={"rows":2,"cols":3,"scale":200}')
  echo "$resp" | tee "$OUT/test7.json" | jq -e '.ok == true' >/dev/null
  local url
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  download_artifact "$url" "$OUT/test7_contact.jpg"
  check_jpeg "$OUT/test7_contact.jpg"
}

# Test 8: contactsheet 5x5
test8() {
  local resp
  resp=$(api_post /v1/contactsheet -F "file=@$SINGLE" \
    -F 'payload={"rows":5,"cols":5}')
  echo "$resp" | tee "$OUT/test8.json" | jq -e '.ok == true' >/dev/null
  local url
  url=$(echo "$resp" | jq -r '.artifacts[0].url')
  download_artifact "$url" "$OUT/test8_contact.jpg"
  check_jpeg "$OUT/test8_contact.jpg"
}

# Test 9: sprites 3x4 interval 1
test9() {
  local resp
  resp=$(api_post /v1/sprites -F "file=@$SINGLE" \
    -F 'payload={"rows":3,"cols":4,"intervalSec":1}')
  echo "$resp" | tee "$OUT/test9.json" | jq -e '.ok == true and (.artifacts | length) == 2' >/dev/null
  local img vtt
  img=$(echo "$resp" | jq -r '.artifacts[] | select(.filename=="sprite.jpg") | .url')
  vtt=$(echo "$resp" | jq -r '.artifacts[] | select(.filename=="sprite.vtt") | .url')
  download_artifact "$img" "$OUT/test9_sprite.jpg"
  download_artifact "$vtt" "$OUT/test9_sprite.vtt"
  check_jpeg "$OUT/test9_sprite.jpg"
}

# Test 10: VTT validity (uses test9 artifact)
test10() {
  check_vtt_xywh "$OUT/test9_sprite.vtt"
  local cues
  cues=$(grep -c '#xywh=' "$OUT/test9_sprite.vtt" || true)
  [[ "$cues" -eq 12 ]]
}

# Test 11: download artifacts not empty (aggregate from tests)
test11() {
  local failed=0
  for f in "$OUT"/*.jpg "$OUT"/*.vtt "$OUT"/*concat.mp4; do
    [[ -f "$f" ]] || continue
    local sz
    sz=$(stat -c%s "$f")
    if [[ "$sz" -lt 20 ]]; then
      echo "empty: $f ($sz bytes)"
      failed=1
    fi
  done
  [[ "$failed" -eq 0 ]]
}

: > "$OUT/summary.tsv"
run_test 1 "POST /v1/concat reencode:false" test1
run_test 2 "POST /v1/concat reencode:true" test2
run_test 3 "POST /v1/thumbnails at" test3
run_test 4 "POST /v1/thumbnails everyMs:1000" test4
run_test 5 "POST /v1/thumbnails sceneAware" test5
run_test 6 "POST /v1/thumbnails at+sceneAware" test6
run_test 7 "POST /v1/contactsheet 2x3 scale200" test7
run_test 8 "POST /v1/contactsheet 5x5" test8
run_test 9 "POST /v1/sprites 3x4 intervalSec:1" test9
run_test 10 "sprite.vtt WEBVTT xywh" test10
run_test 11 "artifacts non-empty" test11

echo "=== SUMMARY ==="
column -t -s'|' "$OUT/summary.tsv" 2>/dev/null || cat "$OUT/summary.tsv"
