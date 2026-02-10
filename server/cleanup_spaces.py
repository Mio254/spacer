"""Remove unwanted spaces from database"""

def cleanup_spaces():
    """Delete old spaces, keep only the new ones with updated locations"""
    from app import create_app, db
    from app.models import Space
    
    app = create_app()
    with app.app_context():
        # Spaces to keep (the ones with new locations you specified)
        spaces_to_keep = [
            "Art Studio",
            "Conference Room", 
            "Meeting Pod",
            "Event Terrace",
            "Nairobi Tech Lab",
            "Physics Research Room"
        ]
        
        # Get all spaces
        all_spaces = Space.query.all()
        
        # Delete spaces not in the keep list
        deleted_count = 0
        for space in all_spaces:
            if space.name not in spaces_to_keep:
                print(f"Deleting: {space.name} (ID: {space.id})")
                db.session.delete(space)
                deleted_count += 1
        
        db.session.commit()
        print(f"\n✅ Deleted {deleted_count} unwanted spaces")
        print(f"✅ Kept {len(spaces_to_keep)} spaces:")
        for name in spaces_to_keep:
            space = Space.query.filter_by(name=name).first()
            if space:
                print(f"   - {space.name} at {space.location}")

if __name__ == "__main__":
    cleanup_spaces()
