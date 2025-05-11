"""
Main entry point for the embedding service application.
This file is used by Railway.app to detect and run the Python application.
"""
from server import app

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    import os
    port = int(os.environ.get('PORT', 5000))
    
    # Start the server
    app.run(debug=False, host='0.0.0.0', port=port)
