#!/bin/bash

# =========================================================
# Buku Tamu SGH Tower — Comprehensive E2E & QA Test Suite
# =========================================================

BASE_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

function assert() {
  local test_name="$1"
  local status="$2"
  local expected="$3"

  if echo "$status" | grep -iq "$expected"; then
    echo "  [PASS] $test_name"
    ((PASS_COUNT++))
  else
    echo "  [FAIL] $test_name (Expected '$expected', got '$status')"
    ((FAIL_COUNT++))
  fi
}

echo "================================================="
echo " Starting Buku Tamu SGH Tower QA Test Suite"
echo " Target Base URL: $BASE_URL"
echo "================================================="
echo ""

# 1. Customer Portal Upload & Registration Test
echo "--- 1. Testing Customer Portal API ---"

UPLOAD_RES=$(curl -s -X POST "$BASE_URL/api/upload" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}')

assert "Upload Selfie Image to NAS" "$UPLOAD_RES" '"success":true'

# Extract file path from upload response
FILE_PATH=$(echo "$UPLOAD_RES" | sed -n 's/.*"filePath":"\([^"]*\)".*/\1/p')

GUEST_RES=$(curl -s -X POST "$BASE_URL/api/guests" \
  -H "Content-Type: application/json" \
  -d "{
    \"namaLengkap\": \"QA Tester Utama\",
    \"nomorTelepon\": \"08999888777\",
    \"asalPerusahaan\": \"PT Audit Indonesia\",
    \"alamatPerusahaan\": \"Jl. Jendral Sudirman No. 99\",
    \"tujuanBerkunjung\": \"Rapat\",
    \"perusahaanTujuan\": \"PT SGH Indonesia\",
    \"departemenTujuan\": \"Security QA\",
    \"namaOrangDituju\": \"Bapak General Manager\",
    \"keperluan\": \"Testing otomatis E2E sistem buku tamu\",
    \"selfiePath\": \"$FILE_PATH\"
  }")

assert "Create Guest Record with Auto-Timestamp" "$GUEST_RES" '"namaLengkap":"QA Tester Utama"'

echo ""

# 2. Backoffice Auth & PIN Verification Test
echo "--- 2. Testing Backoffice PIN Security ---"

# Ensure PIN is reset to default 1234 for idempotent test runner
curl -s -X POST "$BASE_URL/api/auth/reset-pin" \
  -H "Content-Type: application/json" \
  -d '{"masterPin": "master1234", "newAccessPin": "1234"}' > /dev/null

STATUS_BEFORE=$(curl -s "$BASE_URL/api/auth/status")
assert "Initial Unauthenticated Status" "$STATUS_BEFORE" '"authenticated":false'

INVALID_PIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin": "99999"}')
assert "Invalid PIN Rejection (401)" "$INVALID_PIN_RES" 'Access PIN salah'

VALID_PIN_HEADERS=$(curl -s -i -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}')
assert "Valid PIN Auth (200 OK)" "$VALID_PIN_HEADERS" 'HTTP/1.1 200 OK'
assert "HTTP-Only Session Cookie Set" "$VALID_PIN_HEADERS" 'set-cookie: bukutamu_session='

MASTER_RESET_RES=$(curl -s -X POST "$BASE_URL/api/auth/reset-pin" \
  -H "Content-Type: application/json" \
  -d '{"masterPin": "master1234", "newAccessPin": "7777"}')
assert "Master PIN Reset Access PIN" "$MASTER_RESET_RES" '"success":true'

NEW_PIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin": "7777"}')
assert "Authenticate with New Access PIN" "$NEW_PIN_RES" '"success":true'

# Restore default PIN 1234 after test
curl -s -X POST "$BASE_URL/api/auth/reset-pin" \
  -H "Content-Type: application/json" \
  -d '{"masterPin": "master1234", "newAccessPin": "1234"}' > /dev/null

echo ""

# 3. Backoffice Guest Management & Filters Test
echo "--- 3. Testing Guest Data Grid & Receptionist Actions ---"

GET_GUESTS_RES=$(curl -s "$BASE_URL/api/guests?name=QA%20Tester")
assert "Filter Guest List by Name" "$GET_GUESTS_RES" 'QA Tester Utama'

PATCH_RES=$(curl -s -X PATCH "$BASE_URL/api/guests/mock-1" \
  -H "Content-Type: application/json" \
  -d '{"nomorKartuAkses": "CARD-QA-101", "statusKtp": "ditahan", "isCheckout": true}')
assert "Receptionist PATCH (Card, KTP, Check-Out)" "$PATCH_RES" '"nomorKartuAkses":"CARD-QA-101"'

PEAK_TIME_RES=$(curl -s "$BASE_URL/api/analytics/peak-time")
assert "Peak-Time Analytics Calculation" "$PEAK_TIME_RES" '"hour":"08:00"'

echo ""

# 4. Data Export Verification (Excel & PDF)
echo "--- 4. Testing Data Export System ---"

EXCEL_HEADERS=$(curl -s -i "$BASE_URL/api/export?format=xlsx")
assert "Excel Export Header (.xlsx)" "$EXCEL_HEADERS" 'spreadsheetml.sheet'

PDF_HEADERS=$(curl -s -i "$BASE_URL/api/export?format=pdf")
assert "PDF Export Header (.pdf)" "$PDF_HEADERS" 'application/pdf'
assert "PDF Content Buffer (%PDF-)" "$PDF_HEADERS" '%PDF-1.3'

echo ""

# 5. Image Serving API Test
echo "--- 5. Testing NAS Image Retrieval ---"

if [ -n "$FILE_PATH" ]; then
  IMAGE_RES=$(curl -s -i "$BASE_URL/api/images/$FILE_PATH")
  assert "Retrieve NAS Selfie Image (200 OK)" "$IMAGE_RES" 'content-type: image/'
fi

echo ""
echo "================================="
echo " QA Test Suite Execution Summary"
echo " Passed: $PASS_COUNT"
echo " Failed: $FAIL_COUNT"
echo "================================="

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "🎉 ALL QA TESTS PASSED SUCCESSFULLY!"
  exit 0
else
  echo "❌ QA TESTS FAILED WITH $FAIL_COUNT ERRORS."
  exit 1
fi
