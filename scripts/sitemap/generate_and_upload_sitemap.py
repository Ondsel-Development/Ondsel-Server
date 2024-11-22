# SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring, ElementTree

import boto3
import pymongo
from dotenv import load_dotenv


DIR = "/tmp"


def load_environment_variables():
    """Load environment variables from .env file if it exists."""
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI") or os.environ["MONGO_URI"]
    base_url = os.getenv("BASE_URL") or os.environ["BASE_URL"]
    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID") or os.environ["AWS_ACCESS_KEY_ID"]
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY") or os.environ["AWS_SECRET_ACCESS_KEY"]
    aws_s3_bucket = os.getenv("AWS_BUCKET_NAME") or os.environ["AWS_BUCKET_NAME"]
    db_name = os.getenv("DB_NAME") or os.environ["DB_NAME"]
    users_collection_name = os.getenv("USERS_COLLECTION_NAME") or os.environ["USERS_COLLECTION_NAME"]
    shared_models_collection_name = os.getenv("SHARED_MODELS_COLLECTION_NAME") or os.environ["SHARED_MODELS_COLLECTION_NAME"]
    aws_s3_bucket_dir_name = os.getenv("AWS_BUCKET_DIRECTORY_NAME") or os.environ["AWS_BUCKET_DIRECTORY_NAME"]
    return (
        mongo_uri,
        base_url,
        aws_access_key_id,
        aws_secret_access_key,
        aws_s3_bucket,
        db_name,
        users_collection_name,
        shared_models_collection_name,
        aws_s3_bucket_dir_name
    )


def get_mongo_client(mongo_uri):
    """Create and return a MongoDB client."""
    return pymongo.MongoClient(mongo_uri)


def fetch_data_from_db(db, collection, query, fields):
    """Fetch users from the MongoDB database."""
    collection = db[collection]
    return collection.find(query, fields)


def create_sitemap(urls):
    """Create a sitemap XML structure."""
    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for url, lastmod in urls:
        url_element = SubElement(urlset, "url")
        loc = SubElement(url_element, "loc")
        loc.text = url
        lastmod_element = SubElement(url_element, "lastmod")
        lastmod_element.text = lastmod.strftime("%Y-%m-%dT%H:%M:%S%z")
        changefreq = SubElement(url_element, "changefreq")
        changefreq.text = "weekly"
        priority = SubElement(url_element, "priority")
        priority.text = "0.8"

    return urlset


def save_sitemap(sitemap, filename):
    """Save the sitemap XML structure to a file with UTF-8 encoding."""
    tree = ElementTree(sitemap)
    tree.write(filename, xml_declaration=True, encoding='utf-8', method="xml")


def upload_to_s3(file_name, bucket, object_name=None):
    """Upload a file to an S3 bucket."""
    s3_client = boto3.client("s3")
    try:
        s3_client.upload_file(file_name, bucket, object_name or file_name)
        print(f"Successfully uploaded {file_name} to {bucket}/{object_name or file_name}")
    except boto3.exceptions.S3UploadFailedError as e:
        print(f"Failed to upload {file_name} to {bucket}/{object_name or file_name}: {e}")


def generate_sitemap_for_users(db, base_url, collection_name):
    """Generate the sitemap for user profiles."""
    users = fetch_data_from_db(db, collection_name, {}, {"username": 1, "updatedAt": 1})
    urls = [
        (f"{base_url}user/{user['username']}", datetime.fromtimestamp(user["updatedAt"] / 1000))
        for user in users
    ]
    sitemap = create_sitemap(urls)
    save_sitemap(sitemap, f"{DIR}/users-sitemap.xml")


def generate_sitemap_for_shared_models(db, base_url, collection_name):
    """Generate the sitemap for shared models."""
    shared_models = fetch_data_from_db(db, collection_name, {"protection": "Listed"}, {"_id": 1, "updatedAt": 1})
    urls = [
        (f"{base_url}share/{model['_id']}", datetime.fromtimestamp(model["updatedAt"] / 1000))
        for model in shared_models
    ]
    sitemap = create_sitemap(urls)
    save_sitemap(sitemap, f"{DIR}/sharelinks-sitemap.xml")


def create_main_sitemap(sitemaps):
    """Create the main sitemap.xml that references other sitemaps."""
    sitemapindex = Element("sitemapindex", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for sitemap_url in sitemaps:
        sitemap_element = SubElement(sitemapindex, "sitemap")
        loc = SubElement(sitemap_element, "loc")
        loc.text = sitemap_url
        lastmod = SubElement(sitemap_element, "lastmod")
        lastmod.text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S%z")

    save_sitemap(sitemapindex, f"{DIR}/sitemap.xml")


def generate_robots_txt(base_url):
    """Generate a robots.txt file content."""
    lines = [
        "User-agent: *",
        "Disallow:",
        "",
        f"Sitemap: {base_url}sitemap.xml"
    ]
    return "\n".join(lines)


def save_robots_txt(content, filename):
    """Save the robots.txt content to a file."""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)


def main(event, context):
    (
        mongo_uri,
        base_url,
        aws_access_key_id,
        aws_secret_access_key,
        aws_s3_bucket,
        db_name,
        users_collection_name,
        shared_models_collection_name,
        aws_s3_bucket_dir_name,
    ) = load_environment_variables()
    mongo_client = get_mongo_client(mongo_uri)
    db = mongo_client[db_name]

    generate_sitemap_for_users(db, base_url, users_collection_name)
    user_sitemap_filename = "users-sitemap.xml"
    aws_users_sitemap_path = f"{aws_s3_bucket_dir_name}/{user_sitemap_filename}"
    upload_to_s3(f"{DIR}/users-sitemap.xml", aws_s3_bucket, aws_users_sitemap_path)

    generate_sitemap_for_shared_models(db, base_url, shared_models_collection_name)
    shared_model_sitemap_filename = "sharelinks-sitemap.xml"
    aws_shared_models_sitemap_path = f"{aws_s3_bucket_dir_name}/{shared_model_sitemap_filename}"
    upload_to_s3(f"{DIR}/sharelinks-sitemap.xml", aws_s3_bucket, aws_shared_models_sitemap_path)

    sitemaps = [
        f"{base_url}{aws_file_path}" for aws_file_path in (user_sitemap_filename, shared_model_sitemap_filename)
    ]
    create_main_sitemap(sitemaps)
    upload_to_s3(f"{DIR}/sitemap.xml", aws_s3_bucket, f"{aws_s3_bucket_dir_name}/sitemap.xml")

    robots_txt_content = generate_robots_txt(base_url)
    save_robots_txt(robots_txt_content, f"{DIR}/robots.txt")
    upload_to_s3(f"{DIR}/robots.txt", aws_s3_bucket, f"{aws_s3_bucket_dir_name}/robots.txt")


if __name__ == "__main__":
    main({}, {})
