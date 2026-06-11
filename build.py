import subprocess
import sys

args = [
    "flet", "pack",
    "script_manager.py",
    "--name", "FM Optimization",
    "--product-name", "FM Optimization",
    "--file-description", "FM Optimization - Gerenciador de Scripts",
    "--product-version", "1.0.0",
    "--file-version", "1.0.0",
    "--company-name", "FM Optimization",
    "--uac-admin",
    "--debug-console", "False",
    "-y",
]

print("Building FM Optimization...")
result = subprocess.run(args, shell=True)
sys.exit(result.returncode)
