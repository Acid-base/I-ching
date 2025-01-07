from setuptools import find_packages, setup

setup(
    name="i-ching-core",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "google-genai",
        "python-dotenv",
        "uvicorn",
    ],
)
