import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.medicine import Medicine, MedicineType


DEFAULT_MEDICINES = [
    {
        "medicine_code": "AYUR-CHU-001",
        "name": "Ashwagandha Churna",
        "generic_name": "Withania somnifera root powder",
        "classical_reference": "Bhavaprakasha Samhita",
        "category": MedicineType.CHURNA,
        "formulation": "Fine Powder (Churna)",
        "dosage_form": "Powder",
        "manufacturer": "Arya Vaidya Sala / Standard Classical",
        "description": "Classical revitalizing adaptogen (Rasayana) used for stress relief, fatigue, vata disorders, and vitality.",
        "ingredients": "Ashwagandha (Withania somnifera) root",
        "strength": "5 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Store in a cool, dry place away from direct sunlight.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-CHU-002",
        "name": "Triphala Churna",
        "generic_name": "Three myrobalans formulation",
        "classical_reference": "Charaka Samhita, Chikitsa Sthana",
        "category": MedicineType.CHURNA,
        "formulation": "Fine Powder (Churna)",
        "dosage_form": "Powder",
        "manufacturer": "Arya Vaidya Sala / Standard Classical",
        "description": "Tridoshic digestive regulator, gentle bowel regulator, and antioxidant (Rasayana).",
        "ingredients": "Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellirica), Amalaki (Phyllanthus emblica) in equal proportions",
        "strength": "3-6 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Keep container tightly closed after use.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-CHU-003",
        "name": "Avipattikar Churna",
        "generic_name": "Classical Pitta-pacifying digestive powder",
        "classical_reference": "Bhaishajya Ratnavali",
        "category": MedicineType.CHURNA,
        "formulation": "Fine Powder (Churna)",
        "dosage_form": "Powder",
        "manufacturer": "Baidyanath / Standard Classical",
        "description": "Indicated for Amlapitta (hyperacidity), heartburn, burning micturition, and constipation associated with Pitta vitiation.",
        "ingredients": "Trikatu, Triphala, Musta, Vidanga, Ela, Patra, Lavanga, Trivrit, Sharkara",
        "strength": "3-5 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Store in an airtight moisture-proof container.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-CHU-004",
        "name": "Sitopaladi Churna",
        "generic_name": "Classical respiratory demulcent powder",
        "classical_reference": "Sharangadhara Samhita",
        "category": MedicineType.CHURNA,
        "formulation": "Fine Powder (Churna)",
        "dosage_form": "Powder",
        "manufacturer": "Dabur / Standard Classical",
        "description": "Used in respiratory conditions like Kasa (cough), Shwasa (breathing difficulty), low appetite, and mild fever.",
        "ingredients": "Mishri (Sugar candy), Vanshlochan, Pippali, Elaichi, Twak (Cinnamon)",
        "strength": "2-4 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Store in a dry location.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-VAT-001",
        "name": "Brahmi Vati",
        "generic_name": "Bacopa monnieri compound tablets",
        "classical_reference": "Siddha Yoga Sangraha",
        "category": MedicineType.VATI,
        "formulation": "Tablet / Pill (Vati)",
        "dosage_form": "Tablet",
        "manufacturer": "Dhootapapeshwar / Standard Classical",
        "description": "Medhya Rasayana for cognitive health, memory support, mental clarity, and nervous system nourishment.",
        "ingredients": "Brahmi, Shankhapushpi, Vacha, Maricha, Swarna Makshika Bhasma",
        "strength": "250 mg per tablet",
        "unit": "tablet",
        "standard_route": "Oral",
        "storage_instructions": "Store protected from light and moisture.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-VAT-002",
        "name": "Yogaraja Guggulu",
        "generic_name": "Polyherbal Guggulu resin formulation for Vata",
        "classical_reference": "Bhaishajya Ratnavali, Amavata Chikitsa",
        "category": MedicineType.VATI,
        "formulation": "Pill / Tablet (Guggulu)",
        "dosage_form": "Tablet",
        "manufacturer": "Arya Vaidya Sala / Standard Classical",
        "description": "Key formulation for neuromuscular and joint disorders (Amavata, Sandhigata Vata, sciatica, stiffness).",
        "ingredients": "Shuddha Guggulu, Chitraka, Pippalimula, Yavani, Jeeraka, Vidanga, Ajamoda, Triphala, Trikatu",
        "strength": "500 mg per tablet",
        "unit": "tablet",
        "standard_route": "Oral",
        "storage_instructions": "Store in cool dry conditions.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-VAT-003",
        "name": "Chandraprabha Vati",
        "generic_name": "Classical urinary and metabolic health tablets",
        "classical_reference": "Sharangadhara Samhita",
        "category": MedicineType.VATI,
        "formulation": "Pill / Tablet (Vati)",
        "dosage_form": "Tablet",
        "manufacturer": "Baidyanath / Standard Classical",
        "description": "Indicated in urinary tract disorders (Prameha, Mutrakrichra), metabolic debility, and reproductive health.",
        "ingredients": "Shilajit, Guggulu, Karpoora, Vacha, Musta, Haridra, Daruharidra, Trikatu, Triphala, Loha Bhasma",
        "strength": "500 mg per tablet",
        "unit": "tablet",
        "standard_route": "Oral",
        "storage_instructions": "Store in tight, light-resistant container.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-VAT-004",
        "name": "Kanchanar Guggulu",
        "generic_name": "Bauhinia variegata compound formulation",
        "classical_reference": "Bhavaprakasha, Galaganda Rogadhikara",
        "category": MedicineType.VATI,
        "formulation": "Pill / Tablet (Guggulu)",
        "dosage_form": "Tablet",
        "manufacturer": "Kottakkal Arya Vaidya Sala",
        "description": "Used in glandular swellings, lymphadenopathy (Gandamala), cysts (Granthi, Arbuda), and thyroid imbalance support.",
        "ingredients": "Kanchanara twak, Triphala, Trikatu, Varuna twak, Ela, Twak, Patra, Shuddha Guggulu",
        "strength": "500 mg per tablet",
        "unit": "tablet",
        "standard_route": "Oral",
        "storage_instructions": "Store in dry place.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-KAS-001",
        "name": "Maharasnadi Kashayam",
        "generic_name": "Classical Rasna-based decoction",
        "classical_reference": "Sahasrayogam, Kashaya Prakarana",
        "category": MedicineType.KASHAYA,
        "formulation": "Concentrated Herbal Decoction (Kashaya)",
        "dosage_form": "Liquid",
        "manufacturer": "Arya Vaidya Sala / AVP",
        "description": "Potent anti-inflammatory decoction for acute and chronic musculoskeletal Vata disorders, osteo-arthritis, and neuralgias.",
        "ingredients": "Rasna, Dhanvayasa, Bala, Eranda mula, Devadaru, Shati, Guduchi, Shunthi",
        "strength": "15 ml per dose",
        "unit": "ml",
        "standard_route": "Oral",
        "storage_instructions": "Shake well before use. Keep in cool dry place.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-KAS-002",
        "name": "Varunadi Kashayam",
        "generic_name": "Crataeva nurvala based decoction",
        "classical_reference": "Ashtanga Hridaya, Chikitsa Sthana",
        "category": MedicineType.KASHAYA,
        "formulation": "Concentrated Herbal Decoction (Kashaya)",
        "dosage_form": "Liquid",
        "manufacturer": "Arya Vaidya Sala Kottakkal",
        "description": "Indicated in Kapha-Medas disorders, lipomas, benign growths, obesity management, and urinary calculi.",
        "ingredients": "Varuna, Saireyaka, Shatavari, Dahana, Morata, Bilva, Vishanika, Brihati",
        "strength": "15 ml per dose",
        "unit": "ml",
        "standard_route": "Oral",
        "storage_instructions": "Keep tightly closed after opening.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-ARI-001",
        "name": "Amritarishta",
        "generic_name": "Self-generated fermented Guduchi preparation",
        "classical_reference": "Bhaishajya Ratnavali, Jwara Rogadhikara",
        "category": MedicineType.ARISHTA,
        "formulation": "Self-Fermented Liquid (Arishta)",
        "dosage_form": "Liquid",
        "manufacturer": "Arya Vaidya Sala / Baidyanath",
        "description": "Used in post-fever convalescence (Jwara), chronic debility, immunomodulation, and digestive weakness.",
        "ingredients": "Amrita (Guduchi), Dashamula, Jaggery (Guda), Cumin, Maricha, Pippali, Nagakeshara",
        "strength": "20 ml per dose",
        "unit": "ml",
        "standard_route": "Oral",
        "storage_instructions": "Store in a cool dry area away from direct heat.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-ARI-002",
        "name": "Dashamularishta",
        "generic_name": "Ten Roots Fermented Tonic",
        "classical_reference": "Bhaishajya Ratnavali, Sharangadhara Samhita",
        "category": MedicineType.ARISHTA,
        "formulation": "Self-Fermented Liquid (Arishta)",
        "dosage_form": "Liquid",
        "manufacturer": "Dabur / Baidyanath",
        "description": "Comprehensive rejuvenating tonic for post-partum care, fatigue, general debility, and Vata-Kapha balance.",
        "ingredients": "Dashamula, Chitraka, Pushkaramula, Guduchi, Amalaki, Dhataki, Draksha, Honey, Jaggery",
        "strength": "20 ml per dose",
        "unit": "ml",
        "standard_route": "Oral",
        "storage_instructions": "Store in a dry place.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-ASA-001",
        "name": "Drakshasava",
        "generic_name": "Fermented Raisin/Grape tonic",
        "classical_reference": "Bhaishajya Ratnavali",
        "category": MedicineType.ASAVA,
        "formulation": "Self-Fermented Liquid (Asava)",
        "dosage_form": "Liquid",
        "manufacturer": "Arya Vaidya Sala / Baidyanath",
        "description": "Nutritive tonic for anemia (Pandu), general weakness, constipation, and appetite loss.",
        "ingredients": "Draksha (Dry grapes), Sharkara, Madhu, Dhataki pushpa, Trijata, Trikatu, Lavanga",
        "strength": "20 ml per dose",
        "unit": "ml",
        "standard_route": "Oral",
        "storage_instructions": "Keep bottle tightly closed.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-TAI-001",
        "name": "Mahanarayana Taila",
        "generic_name": "Classical multi-herb sesame oil for joints",
        "classical_reference": "Bhaishajya Ratnavali, Vata Vyadhi Chikitsa",
        "category": MedicineType.TAILA,
        "formulation": "Medicated Oil (Taila)",
        "dosage_form": "Oil",
        "manufacturer": "Arya Vaidya Sala / AVP",
        "description": "Premium external application oil for neuromuscular conditions, joint degeneration, stiffness, and body massage (Abhyanga).",
        "ingredients": "Bilva, Ashwagandha, Bala, Shatavari, Rasna, Tila Taila, Godugdha, multiple fragrant herbs",
        "strength": "As required for local application",
        "unit": "ml",
        "standard_route": "External application",
        "storage_instructions": "Store in a cool place away from sun.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-GHR-001",
        "name": "Brahmi Ghrita",
        "generic_name": "Medicated Ghee infused with Bacopa monnieri",
        "classical_reference": "Ashtanga Hridaya, Uttarasthana",
        "category": MedicineType.GHRITA,
        "formulation": "Medicated Ghee (Ghrita)",
        "dosage_form": "Ghee / Paste",
        "manufacturer": "Arya Vaidya Sala Kottakkal",
        "description": "Nootropic ghee preparation for memory enhancement, mental health, cognitive support, and sleep quality.",
        "ingredients": "Brahmi svarasa, Ghrita (Cow's ghee), Trikatu, Shweta & Krishna Trivrit, Danti, Shankhapushpi",
        "strength": "5-10 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Store at room temperature; do not use wet spoon.",
        "is_active": True
    },
    {
        "medicine_code": "AYUR-LEH-001",
        "name": "Chyawanprash Rasayana",
        "generic_name": "Classical Amla-based herbal jelly / electuary",
        "classical_reference": "Charaka Samhita, Chikitsa Sthana",
        "category": MedicineType.LEHYA,
        "formulation": "Herbal Jam / Electuary (Avaleha)",
        "dosage_form": "Paste",
        "manufacturer": "Dabur / Arya Vaidya Sala",
        "description": "Premier Rasayana formulation for cellular rejuvenation, respiratory immunity, and vitality.",
        "ingredients": "Fresh Amalaki, Dashamula, Ashtavarga, Pippali, Draksha, Ela, Ghee, Til oil, Honey, Sugar",
        "strength": "10-12 g per dose",
        "unit": "g",
        "standard_route": "Oral",
        "storage_instructions": "Store in a cool dry place.",
        "is_active": True
    }
]


def seed_medicines(db: Session) -> int:
    """
    Seed initial classical Ayurvedic medicines catalog if not already populated.
    """
    added_count = 0
    for med_data in DEFAULT_MEDICINES:
        existing = db.query(Medicine).filter(Medicine.medicine_code == med_data["medicine_code"]).first()
        if not existing:
            medicine = Medicine(**med_data)
            db.add(medicine)
            added_count += 1

    if added_count > 0:
        db.commit()
        print(f"Successfully seeded {added_count} Ayurvedic medicines into catalog.")
    else:
        print("Ayurvedic medicines catalog is already up to date.")

    return added_count


def main():
    db = SessionLocal()
    try:
        count = seed_medicines(db)
        print(f"Catalog seeding complete. Total newly inserted: {count}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
