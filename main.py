#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

import pikepdf


def main():
    parser = argparse.ArgumentParser(
        description="Unlock a password-protected PDF"
    )
    parser.add_argument("input", help="Path to the password-protected PDF")
    parser.add_argument("password", help="Password to unlock the PDF")
    parser.add_argument(
        "-o", "--output",
        help="Output path for unlocked PDF (default: <input>_unlocked.pdf)"
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: File not found: {input_path}")
        return 1

    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_stem(f"{input_path.stem}_unlocked")

    try:
        with pikepdf.open(input_path, password=args.password) as pdf:
            pdf.save(output_path)
        print(f"Saved unlocked PDF to {output_path}")
    except pikepdf.PasswordError:
        print("Error: Incorrect password")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())