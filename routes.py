from flask import Blueprint, jsonify, request
# Corrected import: Removed the leading dot from '.models'
from models import db, Profile, Project, Document, Bid, Inspection, ChangeOrder
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

# Define the blueprint that will hold all our API routes
api = Blueprint('api', __name__)

# --- Authentication Routes ---

@api.route('/register', methods=['POST'])
def register():
    """
    Handles new user registration.
    Expects email, password, and full_name in the JSON body.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    if not all([email, password, full_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if Profile.query.filter_by(email=email).first():
        return jsonify({"error": "Email address already in use"}), 409

    new_user = Profile(email=email, full_name=full_name)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/login', methods=['POST'])
def login():
    """
    Handles user login.
    Expects email and password. Returns a JWT access token on success.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Profile.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # Create a token with the user's ID and role
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify(access_token=access_token, user={'id': user.id, 'fullName': user.full_name, 'email': user.email, 'role': user.role}), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

# --- Project Routes ---

@api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "Project name is required"}), 400
    
    new_project = Project(
        name=data['name'],
        description=data.get('description'),
        location=data.get('location'),
        budget=data.get('budget'),
        start_date=datetime.strptime(data.get('start_date'), '%Y-%m-%d').date() if data.get('start_date') else None,
        end_date=datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None,
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

@api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    projects = Project.query.order_by(Project.name).all()
    return jsonify([p.to_dict() for p in projects])

@api.route('/projects/<string:project_id>', methods=['GET'])
@jwt_required()
def get_project_details(project_id):
    project = Project.query.get_or_404(project_id)
    project_data = project.to_dict()
    project_data['documents'] = [{'id': d.id, 'name': d.name, 'type': d.type} for d in project.documents]
    project_data['bids'] = [{'id': b.id, 'title': b.title, 'status': b.status, 'amount': float(b.amount or 0)} for b in project.bids]
    project_data['inspections'] = [{'id': i.id, 'title': i.title, 'status': i.status} for i in project.inspections]
    project_data['change_orders'] = [{'id': c.id, 'title': c.title, 'status': c.status, 'amount': float(c.amount)} for c in project.change_orders]
    return jsonify(project_data)

@api.route('/projects/<string:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    for key, value in data.items():
        if hasattr(project, key):
            setattr(project, key, value)
    db.session.commit()
    return jsonify(project.to_dict())

@api.route('/projects/<string:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully"})

# --- Document Routes ---

@api.route('/documents', methods=['GET'])
@jwt_required()
def get_documents():
    docs = Document.query.all()
    return jsonify([{'id': d.id, 'name': d.name, 'type': d.type, 'project_id': d.project_id} for d in docs])

@api.route('/documents', methods=['POST'])
@jwt_required()
def create_document():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('project_id'):
        return jsonify({"error": "Missing required fields"}), 400
    new_doc = Document(name=data['name'], project_id=data['project_id'], type=data.get('type'), uploaded_by=get_jwt_identity()['id'])
    db.session.add(new_doc)
    db.session.commit()
    return jsonify({'id': new_doc.id, 'name': new_doc.name, 'type': new_doc.type, 'project_id': new_doc.project_id}), 201

@api.route('/documents/<string:document_id>', methods=['PUT'])
@jwt_required()
def update_document(document_id):
    doc = Document.query.get_or_404(document_id)
    data = request.get_json()
    doc.name = data.get('name', doc.name)
    doc.type = data.get('type', doc.type)
    db.session.commit()
    return jsonify({'id': doc.id, 'name': doc.name, 'type': doc.type, 'project_id': doc.project_id})

@api.route('/documents/<string:document_id>', methods=['DELETE'])
@jwt_required()
def delete_document(document_id):
    doc = Document.query.get_or_404(document_id)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "Document deleted successfully"})

# --- Bid Routes ---

@api.route('/bids', methods=['GET'])
@jwt_required()
def get_bids():
    bids = Bid.query.all()
    return jsonify([{'id': b.id, 'title': b.title, 'status': b.status, 'amount': float(b.amount or 0), 'project_id': b.project_id} for b in bids])

@api.route('/bids', methods=['POST'])
@jwt_required()
def create_bid():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('project_id'):
        return jsonify({"error": "Missing required fields"}), 400
    new_bid = Bid(title=data['title'], project_id=data['project_id'], status=data.get('status'), amount=data.get('amount'), created_by=get_jwt_identity()['id'])
    db.session.add(new_bid)
    db.session.commit()
    return jsonify({'id': new_bid.id, 'title': new_bid.title, 'status': new_bid.status, 'amount': float(new_bid.amount or 0), 'project_id': new_bid.project_id}), 201

@api.route('/bids/<string:bid_id>', methods=['PUT'])
@jwt_required()
def update_bid(bid_id):
    bid = Bid.query.get_or_404(bid_id)
    data = request.get_json()
    bid.title = data.get('title', bid.title)
    bid.status = data.get('status', bid.status)
    bid.amount = data.get('amount', bid.amount)
    db.session.commit()
    return jsonify({'id': bid.id, 'title': bid.title, 'status': bid.status, 'amount': float(bid.amount or 0), 'project_id': bid.project_id})

@api.route('/bids/<string:bid_id>', methods=['DELETE'])
@jwt_required()
def delete_bid(bid_id):
    bid = Bid.query.get_or_404(bid_id)
    db.session.delete(bid)
    db.session.commit()
    return jsonify({"message": "Bid deleted successfully"})

# --- Inspection Routes ---

@api.route('/inspections', methods=['GET'])
@jwt_required()
def get_inspections():
    inspections = Inspection.query.all()
    return jsonify([{'id': i.id, 'title': i.title, 'status': i.status, 'project_id': i.project_id} for i in inspections])

@api.route('/inspections', methods=['POST'])
@jwt_required()
def create_inspection():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('project_id'):
        return jsonify({"error": "Missing required fields"}), 400
    new_inspection = Inspection(title=data['title'], project_id=data['project_id'], status=data.get('status'), notes=data.get('notes'), inspector_id=get_jwt_identity()['id'])
    db.session.add(new_inspection)
    db.session.commit()
    return jsonify({'id': new_inspection.id, 'title': new_inspection.title, 'status': new_inspection.status, 'project_id': new_inspection.project_id}), 201

@api.route('/inspections/<string:inspection_id>', methods=['PUT'])
@jwt_required()
def update_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    data = request.get_json()
    inspection.title = data.get('title', inspection.title)
    inspection.status = data.get('status', inspection.status)
    inspection.notes = data.get('notes', inspection.notes)
    db.session.commit()
    return jsonify({'id': inspection.id, 'title': inspection.title, 'status': inspection.status, 'project_id': inspection.project_id})

@api.route('/inspections/<string:inspection_id>', methods=['DELETE'])
@jwt_required()
def delete_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    db.session.delete(inspection)
    db.session.commit()
    return jsonify({"message": "Inspection deleted successfully"})

# --- Change Order Routes ---

@api.route('/change_orders', methods=['GET'])
@jwt_required()
def get_change_orders():
    orders = ChangeOrder.query.all()
    return jsonify([{'id': o.id, 'title': o.title, 'status': o.status, 'amount': float(o.amount), 'project_id': o.project_id} for o in orders])

@api.route('/change_orders', methods=['POST'])
@jwt_required()
def create_change_order():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('project_id') or not data.get('amount'):
        return jsonify({"error": "Missing required fields"}), 400
    new_order = ChangeOrder(title=data['title'], project_id=data['project_id'], amount=data['amount'], status=data.get('status'), submitted_by=get_jwt_identity()['id'])
    db.session.add(new_order)
    db.session.commit()
    return jsonify({'id': new_order.id, 'title': new_order.title, 'status': new_order.status, 'amount': float(new_order.amount), 'project_id': new_order.project_id}), 201

@api.route('/change_orders/<string:order_id>', methods=['PUT'])
@jwt_required()
def update_change_order(order_id):
    order = ChangeOrder.query.get_or_404(order_id)
    data = request.get_json()
    order.title = data.get('title', order.title)
    order.status = data.get('status', order.status)
    order.amount = data.get('amount', order.amount)
    db.session.commit()
    return jsonify({'id': order.id, 'title': order.title, 'status': order.status, 'amount': float(order.amount), 'project_id': order.project_id})

@api.route('/change_orders/<string:order_id>', methods=['DELETE'])
@jwt_required()
def delete_change_order(order_id):
    order = ChangeOrder.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Change order deleted successfully"})