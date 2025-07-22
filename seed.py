from app import app
from models import db, Company, Profile, Project, Document, Bid, Inspection, ChangeOrder
from datetime import date

def seed_data():
    """
    Seeds the database with sample data for the construction management platform.
    This function should be run within a Flask application context.
    """
    with app.app_context():
        print("Starting database seeding...")
        
        # Clean up existing data by dropping all tables and recreating them
        db.drop_all()
        db.create_all()

        # --- Create Companies ---
        company1 = Company(id='550e8400-e29b-41d4-a716-446655440001', name='Anderson Development Corp', type='owner', address='123 Business Ave, Downtown', phone='555-0101', email='contact@andersondev.com')
        company2 = Company(id='550e8400-e29b-41d4-a716-446655440002', name='Premier Construction LLC', type='general_contractor', address='456 Construction Blvd', phone='555-0102', email='info@premierconstruction.com')
        company3 = Company(id='550e8400-e29b-41d4-a716-446655440003', name='Rodriguez Electrical', type='specialty_contractor', address='789 Electric St', phone='555-0103', email='service@rodriguezelectric.com')
        
        db.session.add_all([company1, company2, company3])
        db.session.commit()
        print("Companies seeded.")

        # --- Create User Profiles with Hashed Passwords ---
        # Note: In a real app, users would register themselves. This is for demo purposes.
        profile1 = Profile(id='user_owner_01', email='owner@demo.com', full_name='John Anderson', role='owner', company_id=company1.id)
        profile1.set_password('demo123')

        profile2 = Profile(id='user_gc_01', email='gc@demo.com', full_name='Jane Smith', role='general_contractor', company_id=company2.id)
        profile2.set_password('demo123')

        profile3 = Profile(id='user_sc_01', email='sc@demo.com', full_name='Carlos Rodriguez', role='specialty_contractor', company_id=company3.id)
        profile3.set_password('demo123')

        db.session.add_all([profile1, profile2, profile3])
        db.session.commit()
        print("User profiles seeded.")

        # --- Create Projects ---
        project1 = Project(id='650e8400-e29b-41d4-a716-446655440001', name='Downtown Office Complex', description='Modern 15-story office building with retail space', status='active', start_date=date(2024, 1, 15), end_date=date(2025, 6, 15), budget=8200000.00, actual_cost=6150000.00, progress=75, location='Downtown District', phase='Interior Fit-out')
        project2 = Project(id='650e8400-e29b-41d4-a716-446655440002', name='Residential Tower A', description='25-floor residential tower with amenities', status='active', start_date=date(2023, 11, 1), end_date=date(2025, 12, 30), budget=12500000.00, actual_cost=5625000.00, progress=45, location='Westside', phase='Structural Work')
        project3 = Project(id='650e8400-e29b-41d4-a716-446655440003', name='Shopping Center Renovation', description='Complete renovation of existing shopping center', status='completed', start_date=date(2024, 2, 1), end_date=date(2025, 4, 20), budget=3800000.00, actual_cost=3420000.00, progress=100, location='East Mall District', phase='Completed')

        db.session.add_all([project1, project2, project3])
        db.session.commit()
        print("Projects seeded.")

        # --- Create Documents ---
        doc1 = Document(project_id=project1.id, name='Architectural Plans - Level 1-5.pdf', type='drawing', version='v2.1', uploaded_by=profile2.id)
        doc2 = Document(project_id=project1.id, name='Structural Specifications.pdf', type='specification', version='v1.3', uploaded_by=profile2.id)
        doc3 = Document(project_id=project2.id, name='Site Photo - Foundation Progress.jpg', type='photo', version='v1.0', uploaded_by=profile2.id)
        
        db.session.add_all([doc1, doc2, doc3])
        db.session.commit()
        print("Documents seeded.")

        # --- Create Bids ---
        bid1 = Bid(project_id=project1.id, title='Electrical Work Package', status='sent', amount=450000.00, created_by=profile2.id)
        bid2 = Bid(project_id=project1.id, title='HVAC Installation', status='received', amount=320000.00, created_by=profile2.id)
        bid3 = Bid(project_id=project2.id, title='Plumbing Package', status='awarded', amount=280000.00, created_by=profile2.id)

        db.session.add_all([bid1, bid2, bid3])
        db.session.commit()
        print("Bids seeded.")

        # --- Create Inspections ---
        insp1 = Inspection(project_id=project1.id, title='Foundation Inspection', status='completed', notes='Foundation meets all specifications.', inspector_id=profile2.id)
        insp2 = Inspection(project_id=project1.id, title='Safety Equipment Check', status='pending', inspector_id=profile2.id)
        insp3 = Inspection(project_id=project2.id, title='Electrical Rough-in', status='failed', notes='Several code violations found.', inspector_id=profile3.id)

        db.session.add_all([insp1, insp2, insp3])
        db.session.commit()
        print("Inspections seeded.")
        
        # --- Create Change Orders ---
        co1 = ChangeOrder(project_id=project1.id, title='Additional Electrical Outlets', amount=8500.00, status='approved', submitted_by=profile2.id)
        co2 = ChangeOrder(project_id=project1.id, title='HVAC System Upgrade', amount=15000.00, status='pending', submitted_by=profile2.id)
        co3 = ChangeOrder(project_id=project2.id, title='Foundation Redesign', amount=-5000.00, status='rejected', submitted_by=profile2.id)
        
        db.session.add_all([co1, co2, co3])
        db.session.commit()
        print("Change Orders seeded.")

        print("\nDatabase seeding completed successfully!")

if __name__ == '__main__':
    # This allows the script to be run directly from the command line
    # to seed the database.
    seed_data()
