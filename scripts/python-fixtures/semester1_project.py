test_password = "sunshine123"
checker_for = "my game account"

length = len(test_password)

has_digit = False
has_upper = False
has_lower = False
has_symbol = False

for character in test_password:
    if character.isdigit():
        has_digit = True
    elif character.isupper():
        has_upper = True
    elif character.islower():
        has_lower = True
    else:
        has_symbol = True

variety = 0
if has_digit:
    variety = variety + 1
if has_upper:
    variety = variety + 1
if has_lower:
    variety = variety + 1
if has_symbol:
    variety = variety + 1

def rate(length, variety):
    if length >= 16:
        return "STRONG"
    elif length >= 12 and variety >= 2:
        return "OKAY"
    else:
        return "WEAK"

rating = rate(length, variety)

print("Checking a password for:", checker_for)
print("Length:", length)
print("Kinds of character:", variety)
print("Rating:", rating)

if rating == "WEAK":
    print("Advice: make it longer. Length beats symbols.")
elif rating == "OKAY":
    print("Advice: add another word to get past 16.")
else:
    print("Advice: good. Never reuse it on another site.")

import hashlib

hashed = hashlib.sha256(test_password.encode()).hexdigest()
print()
print("What a site should store instead of your password:")
print(hashed)
