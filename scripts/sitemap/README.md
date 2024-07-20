# Sitemap Generator and Uploader

This script generates `sitemap.xml` files for user profiles and shared links from a MongoDB database and uploads them to an AWS S3 bucket. It is designed to be run from the `scripts` folder at the root of your project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

## Prerequisites

- Python 3.6+
- MongoDB
- AWS S3

## Setup

1. **Clone the repository** (if not already done):
    ```bash
    git clone <repository_url>
    cd your_project_root
    ```

2. **Navigate to the script directory**:
    ```bash
    cd scripts
    ```

3. **Install the required Python packages**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Create a `.env` file**:
    - Copy the `.env.example` file to `.env`:
    ```bash
    cp .env.example .env
    ```
    - Fill in the `.env` file with your MongoDB and AWS credentials, and other configuration details.

## Usage

1. **Run the script**:
    ```bash
    python generate_and_upload_sitemap.py
    ```

This will generate `users-sitemap.xml`, `sharelinks-sitemap.xml`, and a main `sitemap.xml` file, then upload them to the specified AWS S3 bucket.

## Environment Variables

The script uses environment variables for configuration. These can be set in a `.env` file at the root of your project. If the `.env` file is not present, the script will use environment variables set in your system.

### `.env` File Example

```dotenv
# MongoDB settings
MONGO_URI=mongodb://localhost:27017/
DB_NAME=your_database
USERS_COLLECTION_NAME=users
SHARED_MODELS_COLLECTION_NAME=shared-models

# Base URL for your website
BASE_URL=http://yourdomain.com/

# AWS S3 settings
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_BUCKET_DIRECTORY_NAME=sitemaps
```