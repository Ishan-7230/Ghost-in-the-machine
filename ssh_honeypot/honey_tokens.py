import os
import random
import string
import base64

def generate_kyber_key_stub():
    """
    Simulates a NIST-approved CRYSTALS-Kyber post-quantum cryptographic private key.
    These are lattice-based and look significantly different from RSA/Ed25519.
    """
    dummy_data = os.urandom(1600 + random.randint(0, 100))
    b64_data = base64.b64encode(dummy_data).decode('utf-8')
    
    pem_lines = [b64_data[i:i+64] for i in range(0, len(b64_data), 64)]
    
    key = "-----BEGIN KYBER PRIVATE KEY-----\n"
    key += "\n".join(pem_lines) + "\n"
    key += "-----END KYBER PRIVATE KEY-----\n"
    return key

def generate_dilithium_key_stub():
    """
    Simulates a CRYSTALS-Dilithium post-quantum signature key.
    """
    dummy_data = os.urandom(2500 + random.randint(0, 100))
    b64_data = base64.b64encode(dummy_data).decode('utf-8')
    
    pem_lines = [b64_data[i:i+64] for i in range(0, len(b64_data), 64)]
    
    key = "-----BEGIN DILITHIUM PRIVATE KEY-----\n"
    key += "\n".join(pem_lines) + "\n"
    key += "-----END DILITHIUM PRIVATE KEY-----\n"
    return key

def deploy_honey_tokens(fs_simulator):
    """
    Injects the Quantum-Ready honey-tokens into the honeypot's virtual filesystem.
    """
    ssh_kyber = generate_kyber_key_stub()
    aws_dilithium = generate_dilithium_key_stub()
    
    fs_simulator["/root/.ssh"]["id_kyber"] = ssh_kyber
    fs_simulator["/root/.ssh"]["id_kyber.pub"] = "ssh-kyber AAA... [PQC-Simulated-Pubkey] root@internal"
    
    if "/home/admin" in fs_simulator:
        if ".aws" not in fs_simulator["/home/admin"]:
            fs_simulator["/home/admin"][".aws"] = {}
        fs_simulator["/home/admin"][".aws"]["credentials_pqc"] = """
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

pqc_signature_key = """ + aws_dilithium


def is_quantum_brute_force_attempt(command):
    """
    If the attacker uses tools designed to break or parse these specific keys,
    it triggers a State-Actor flag.
    """
    cmd = command.lower()
    
    if "hashcat" in cmd or "john" in cmd or "crack" in cmd:
         if "kyber" in cmd or "dilithium" in cmd or "pqc" in cmd:
             return True
             
    if "fplll" in cmd or "sagemath" in cmd:
         return True
         
    return False

def get_token_payload(command):
    """
    If the attacker tries to read the quantum honey tokens, serve them directly.
    """
    cmd = command.lower()
    if "cat" in cmd or "head" in cmd or "less" in cmd or "tail" in cmd:
        if "id_kyber" in cmd:
            return generate_kyber_key_stub()
        if "dilithium" in cmd or "credentials_pqc" in cmd:
            return generate_dilithium_key_stub()
    return None

if __name__ == "__main__":
    print(generate_kyber_key_stub())
