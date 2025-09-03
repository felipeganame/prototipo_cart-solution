#!/bin/bash

echo "Testing admin login..."

# Test login
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pedisolution.com",
    "password": "admin123"
  }' -c cookies.txt)

echo "Login response: $LOGIN_RESPONSE"

# Test profile with cookies
echo "Testing profile access..."
PROFILE_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/user/profile" \
  -b cookies.txt)

echo "Profile response: $PROFILE_RESPONSE"

# Test admin users API
echo "Testing admin users API..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/admin/users" \
  -b cookies.txt)

echo "Users response: $USERS_RESPONSE"

# Cleanup
rm -f cookies.txt
