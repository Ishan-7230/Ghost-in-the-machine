import os
import random
import datetime
import logging
from PIL import Image, ImageDraw, ImageFont
import config

logger = logging.getLogger("ghost.visual")

class VisualDeceptionEngine:
    def __init__(self):
        self.fake_dir = config.FAKE_IMAGE_DIR
        os.makedirs(self.fake_dir, exist_ok=True)
        self._classification_levels = [
            "TOP SECRET // SI // NOFORN",
            "SECRET // INTERNAL USE ONLY",
            "CONFIDENTIAL — CRYPTOBRIDGE",
            "RESTRICTED — PROJECT PHOENIX",
            "CLASSIFIED — EYES ONLY",
        ]
        self._departments = [
            "CryptoBridge Security Operations",
            "Infrastructure & DevOps",
            "Project Phoenix — R&D Division",
            "Financial Systems Engineering",
            "Executive Intelligence Unit",
        ]

    def generate_fake_document(self, doc_type="financial_report", filename=None):
        generators = {
            "financial_report": self._gen_financial_report,
            "network_diagram": self._gen_network_diagram,
            "credentials_sheet": self._gen_credentials_sheet,
            "architecture_plan": self._gen_architecture_plan,
        }

        generator = generators.get(doc_type, self._gen_financial_report)

        if not filename:
            filename = f"{doc_type}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

        filepath = os.path.join(self.fake_dir, filename)
        img = generator()
        img = self._apply_watermark(img)
        img = self._apply_classification_header(img)
        img.save(filepath, "PNG")

        logger.info("Generated fake document: %s (%s)", filename, doc_type)
        return filepath

    def generate_fake_image_for_path(self, virtual_path):
        path_lower = virtual_path.lower()

        if any(k in path_lower for k in ["financial", "budget", "revenue", "report"]):
            return self.generate_fake_document("financial_report")
        elif any(k in path_lower for k in ["network", "diagram", "topology", "infra"]):
            return self.generate_fake_document("network_diagram")
        elif any(k in path_lower for k in ["credential", "password", "secret", "key"]):
            return self.generate_fake_document("credentials_sheet")
        elif any(k in path_lower for k in ["arch", "design", "plan", "phoenix"]):
            return self.generate_fake_document("architecture_plan")
        else:
            doc_type = random.choice(config.FAKE_DOCUMENT_TYPES)
            return self.generate_fake_document(doc_type)

    def get_fake_binary_content(self, virtual_path):
        filepath = self.generate_fake_image_for_path(virtual_path)
        with open(filepath, "rb") as f:
            return f.read()

    def _gen_financial_report(self):
        img = Image.new("RGB", (1200, 1600), "#FFFFFF")
        draw = ImageDraw.Draw(img)

        try:
            title_font = ImageFont.truetype("arial.ttf", 36)
            header_font = ImageFont.truetype("arial.ttf", 24)
            body_font = ImageFont.truetype("arial.ttf", 16)
            small_font = ImageFont.truetype("arial.ttf", 12)
        except (OSError, IOError):
            title_font = ImageFont.load_default()
            header_font = title_font
            body_font = title_font
            small_font = title_font

        y = 120

        draw.text((100, y), "CRYPTOBRIDGE FINANCIAL REPORT", fill="#000000")
        y += 60
        draw.text((100, y), f"Q4 {datetime.datetime.now().year - 1} — Confidential", fill="#333333")
        y += 50

        draw.line([(80, y), (1120, y)], fill="#CCCCCC")
        y += 30

        rows = [
            ("Total Revenue", f"${random.randint(12, 45)},{random.randint(100, 999)},{random.randint(100, 999)}"),
            ("Trading Volume", f"${random.randint(100, 500)},{random.randint(100, 999)},{random.randint(100, 999)}"),
            ("Active Wallets", f"{random.randint(50, 200)},{random.randint(100, 999)}"),
            ("BTC Holdings", f"{random.randint(150, 800)}.{random.randint(10, 99)} BTC"),
            ("ETH Holdings", f"{random.randint(2000, 8000)}.{random.randint(10, 99)} ETH"),
            ("Operating Costs", f"${random.randint(3, 12)},{random.randint(100, 999)},{random.randint(100, 999)}"),
            ("Net Profit", f"${random.randint(5, 20)},{random.randint(100, 999)},{random.randint(100, 999)}"),
            ("Pending Settlements", f"${random.randint(1, 5)},{random.randint(100, 999)},{random.randint(100, 999)}"),
        ]

        for label, value in rows:
            draw.text((120, y), label, fill="#444444")
            draw.text((600, y), value, fill="#000000")
            y += 35
            draw.line([(120, y - 5), (900, y - 5)], fill="#EEEEEE")

        y += 30

        draw.text((100, y), "Hot Wallet Addresses", fill="#000000")
        y += 40
        wallets = [
            ("BTC Primary", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"),
            ("ETH Primary", "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08"),
            ("BTC Reserve", "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"),
            ("ETH Reserve", "0xDE0B295669a9FD93d5F28D9Ec85E40f4cb697BAe"),
        ]
        for label, addr in wallets:
            draw.text((140, y), f"{label}:", fill="#666666")
            draw.text((340, y), addr, fill="#000000")
            y += 30

        y += 40
        draw.text((100, y), "Internal Notes", fill="#000000")
        y += 40
        notes = [
            "- Cold storage migration scheduled for Q1 2024",
            "- Insurance coverage renewal pending (> $50M threshold)",
            f"- Vault unseal endpoint: https://10.0.6.10:8200",
            f"- DB Master: 10.0.5.114 (pass: Xk9#p0!)",
            "- AUDIT: Reconcile discrepancy in hot wallet #4",
        ]
        for note in notes:
            draw.text((120, y), note, fill="#880000")
            y += 28

        draw.text((100, 1520), f"Generated: {datetime.datetime.now().isoformat()}", fill="#999999")
        draw.text((100, 1545), "Document ID: CB-FIN-" + str(random.randint(10000, 99999)), fill="#999999")

        return img

    def _gen_network_diagram(self):
        img = Image.new("RGB", (1400, 1000), "#1E1E2E")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 14)
            title_font = ImageFont.truetype("arial.ttf", 28)
        except (OSError, IOError):
            font = ImageFont.load_default()
            title_font = font

        draw.text((500, 30), "CryptoBridge Network Topology", fill="#89DCEB")

        nodes = [
            (200, 200, "WAF/LB\n203.0.113.1", "#F38BA8"),
            (700, 200, "prod-srv-01\n10.0.3.47", "#A6E3A1"),
            (400, 400, "db-primary\n10.0.5.114", "#F9E2AF"),
            (700, 400, "db-replica\n10.0.5.115", "#F9E2AF"),
            (1000, 200, "cache-01\n10.0.3.48", "#89B4FA"),
            (1000, 400, "vault-01\n10.0.6.10", "#CBA6F7"),
            (200, 600, "k8s-master\n10.0.7.1", "#89DCEB"),
            (500, 600, "monitor-01\n10.0.3.50", "#F5C2E7"),
            (800, 600, "dev-srv-01\n10.0.3.12", "#A6E3A1"),
            (1100, 600, "staging\n10.0.4.20", "#FAB387"),
        ]

        for x, y, label, color in nodes:
            draw.rounded_rectangle(
                [(x - 70, y - 35), (x + 70, y + 35)],
                radius=8, fill=color + "33", outline=color, width=2,
            )
            lines = label.split("\n")
            for i, line in enumerate(lines):
                bbox = draw.textbbox((0, 0), line, font=font)
                tw = bbox[2] - bbox[0]
                draw.text((x - tw // 2, y - 15 + i * 18), line, fill="#CDD6F4")

        connections = [
            (200, 200, 700, 200), (700, 200, 400, 400),
            (700, 200, 700, 400), (700, 200, 1000, 200),
            (700, 200, 1000, 400), (200, 600, 700, 200),
            (500, 600, 700, 200), (800, 600, 700, 200),
        ]
        for x1, y1, x2, y2 in connections:
            draw.line([(x1, y1), (x2, y2)], fill="#585B70")

        draw.text((50, 900), "PORTS: SSH(22) HTTP(80,443) PG(5432) Redis(6379) Mongo(27017) K8s(6443)", fill="#A6ADC8")

        return img

    def _gen_credentials_sheet(self):
        img = Image.new("RGB", (1200, 900), "#FDF6E3")
        draw = ImageDraw.Draw(img)

        try:
            title_font = ImageFont.truetype("arial.ttf", 28)
            body_font = ImageFont.truetype("arial.ttf", 15)
            small_font = ImageFont.truetype("arial.ttf", 11)
        except (OSError, IOError):
            title_font = ImageFont.load_default()
            body_font = title_font
            small_font = title_font

        y = 100
        draw.text((100, y), "INTERNAL CREDENTIALS SHEET", fill="#DC322F")
        y += 50
        draw.text((100, y), "CryptoBridge — Updated " + datetime.datetime.now().strftime("%B %Y"),
                  fill="#586E75")
        y += 50

        creds = [
            ("PostgreSQL (prod)", "10.0.5.114:5432", "cb_admin", "Xk9#p0!"),
            ("PostgreSQL (staging)", "10.0.4.20:5432", "cb_admin", "staging_pass_2024"),
            ("Redis (cache)", "10.0.3.48:6379", "default", "r3d1s_pr0d_p@ss"),
            ("MongoDB (analytics)", "10.0.5.114:27017", "mongo_admin", "m0ng0_s3cur3_k3y!"),
            ("Vault (secrets)", "10.0.6.10:8200", "admin", "hvs.CAESIJlGSDK8token"),
            ("Jenkins (CI)", "10.0.3.12:8080", "admin", "j3nk1ns_4dm1n_2024"),
            ("Grafana (monitor)", "10.0.3.50:3000", "admin", "gr4f4n4_pr0d!"),
            ("Docker Registry", "registry.internal:5000", "admin", "d0ck3r_r3g1stry_p@ss"),
            ("AWS Console", "console.aws.amazon.com", "AKIAIOSFODNN7EXAMPLE", "wJalrXUtnFEMI/K7MDENG"),
            ("K8s Dashboard", "10.0.7.1:6443", "admin", "eyJhbGciOiJSUzI1Ni..."),
        ]

        draw.text((100, y), "Service", fill="#B58900")
        draw.text((360, y), "Endpoint", fill="#B58900")
        draw.text((620, y), "Username", fill="#B58900")
        draw.text((820, y), "Password", fill="#B58900")
        y += 8
        draw.line([(90, y + 20), (1110, y + 20)], fill="#93A1A1")
        y += 30

        for service, endpoint, user, passwd in creds:
            draw.text((100, y), service, fill="#073642")
            draw.text((360, y), endpoint, fill="#073642")
            draw.text((620, y), user, fill="#073642")
            draw.text((820, y), passwd, fill="#073642")
            y += 32
            draw.line([(100, y - 5), (1100, y - 5)], fill="#EEE8D5")

        y += 30
        draw.rectangle([(80, y), (1120, y + 50)], fill="#FAD1D1")
        draw.text((100, y + 15), "⚠  DO NOT share this document. Rotate all credentials quarterly.", fill="#CC0000")

        draw.text((100, 840), "Auto-generated by VaultBot — Destroy after reading", fill="#93A1A1")

        return img

    def _gen_architecture_plan(self):
        img = Image.new("RGB", (1200, 1000), "#F8F9FA")
        draw = ImageDraw.Draw(img)

        try:
            title_font = ImageFont.truetype("arial.ttf", 30)
            body_font = ImageFont.truetype("arial.ttf", 16)
        except (OSError, IOError):
            title_font = ImageFont.load_default()
            body_font = title_font

        y = 80
        draw.text((80, y), "PROJECT PHOENIX — Architecture Plan", fill="#343A40")
        y += 60

        sections = [
            "1. Migration from monolith to microservices on K8s",
            "2. New DEX engine: Rust-based matching engine",
            "3. Multi-chain wallet support (BTC, ETH, SOL, AVAX)",
            "4. Zero-knowledge proof integration for compliance",
            "5. HSM integration for institutional-grade key mgmt",
            "",
            "Infrastructure:",
            f"  Primary DB: Aurora PostgreSQL (migrating from 10.0.5.114)",
            f"  Cache: Redis Cluster (3 nodes, currently at 10.0.3.48)",
            f"  Secrets: HashiCorp Vault (HA mode, 10.0.6.10)",
            f"  K8s: EKS (migrating from self-hosted at 10.0.7.1)",
            "",
            "Timeline:",
            "  Phase 1 (Q1): Database migration + K8s setup",
            "  Phase 2 (Q2): Service decomposition",
            "  Phase 3 (Q3): DEX engine launch",
            "  Phase 4 (Q4): Multi-chain + ZKP integration",
            "",
            "Budget: $2.4M allocated (approved by CFO)",
            "Team: 12 engineers + 3 SREs",
            f"Project Lead: sarah.chen@cryptobridge.io",
        ]

        for line in sections:
            draw.text((100, y), line, fill="#495057")
            y += 30 if line else 15

        return img

    def _apply_watermark(self, img):
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        try:
            wm_font = ImageFont.truetype("arial.ttf", 60)
        except (OSError, IOError):
            wm_font = ImageFont.load_default()

        text = config.WATERMARK_TEXT
        w, h = img.size

        for y_pos in range(-h, h * 2, 200):
            for x_pos in range(-w, w * 2, 500):
                draw.text(
                    (x_pos, y_pos), text,
                    fill=(200, 0, 0, 35),
                    font=wm_font,
                )

        img_rgba = img.convert("RGBA")
        watermarked = Image.alpha_composite(img_rgba, overlay)
        return watermarked.convert("RGB")

    def _apply_classification_header(self, img):
        w, h = img.size
        draw = ImageDraw.Draw(img)
        classification = random.choice(self._classification_levels)

        try:
            banner_font = ImageFont.truetype("arial.ttf", 18)
        except (OSError, IOError):
            banner_font = ImageFont.load_default()

        draw.rectangle([(0, 0), (w, 40)], fill="#8B0000")
        bbox = draw.textbbox((0, 0), classification, font=banner_font)
        tw = bbox[2] - bbox[0]
        draw.text(((w - tw) // 2, 10), classification, fill="#FFFFFF")

        draw.rectangle([(0, h - 40), (w, h)], fill="#8B0000")
        draw.text(((w - tw) // 2, h - 30), classification, fill="#FFFFFF")

        return img
