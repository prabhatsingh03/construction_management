import uuid
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

def generate_uuid():
    """Generates a unique string ID."""
    return str(uuid.uuid4())

class Company(db.Model):
    """Represents a company in the system."""
    __tablename__ = 'companies'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String, default='contractor')
    address = db.Column(db.String)
    phone = db.Column(db.String)
    email = db.Column(db.String)
    website = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Profile(db.Model):
    """Represents a user profile, linked to authentication."""
    __tablename__ = 'profiles'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    email = db.Column(db.String, unique=True, nullable=False)
    full_name = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String, nullable=False, default='field_team')
    company_id = db.Column(db.String, db.ForeignKey('companies.id'))
    
    company = db.relationship('Company', backref='profiles')

    def set_password(self, password):
        """Hashes and sets the user's password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

class Project(db.Model):
    """Represents a construction project."""
    __tablename__ = 'projects'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    status = db.Column(db.String, default='planning')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Numeric(15, 2), default=0)
    actual_cost = db.Column(db.Numeric(15, 2), default=0)
    progress = db.Column(db.Integer, default=0)
    location = db.Column(db.String)
    phase = db.Column(db.String, default='Planning')

    # Relationships
    documents = db.relationship('Document', backref='project', lazy=True, cascade="all, delete-orphan")
    bids = db.relationship('Bid', backref='project', lazy=True, cascade="all, delete-orphan")
    inspections = db.relationship('Inspection', backref='project', lazy=True, cascade="all, delete-orphan")
    change_orders = db.relationship('ChangeOrder', backref='project', lazy=True, cascade="all, delete-orphan")

    __table_args__ = (CheckConstraint('progress >= 0 AND progress <= 100'),)

    def to_dict(self):
        """Serializes the object to a dictionary."""
        return {
            'id': self.id, 'name': self.name, 'description': self.description,
            'status': self.status, 'start_date': str(self.start_date) if self.start_date else None,
            'end_date': str(self.end_date) if self.end_date else None, 
            'budget': float(self.budget) if self.budget is not None else 0,
            'actual_cost': float(self.actual_cost) if self.actual_cost is not None else 0, 
            'progress': self.progress, 'location': self.location, 'phase': self.phase
        }

class Document(db.Model):
    """Represents a project document."""
    __tablename__ = 'documents'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String, default='other')
    version = db.Column(db.String, default='v1.0')
    uploaded_by = db.Column(db.String, db.ForeignKey('profiles.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Bid(db.Model):
    """Represents a bid for a project."""
    __tablename__ = 'bids'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='draft')
    amount = db.Column(db.Numeric(15, 2))
    created_by = db.Column(db.String, db.ForeignKey('profiles.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Inspection(db.Model):
    """Represents a quality or safety inspection."""
    __tablename__ = 'inspections'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='pending')
    notes = db.Column(db.String)
    inspector_id = db.Column(db.String, db.ForeignKey('profiles.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class ChangeOrder(db.Model):
    """Represents a financial change order."""
    __tablename__ = 'change_orders'
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    status = db.Column(db.String, default='pending')
    submitted_by = db.Column(db.String, db.ForeignKey('profiles.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
