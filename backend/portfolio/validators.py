from pathlib import Path
from django.core.exceptions import ValidationError
from PIL import Image

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

def validate_image(file):
    if Path(file.name).suffix.lower() not in IMAGE_EXTENSIONS:
        raise ValidationError('Upload a JPG, PNG, or WebP image.')
    if file.size > 5 * 1024 * 1024:
        raise ValidationError('Images must be 5 MB or smaller.')
    try:
        Image.open(file).verify()
        file.seek(0)
    except Exception as exc:
        file.seek(0)
        raise ValidationError('The uploaded image could not be decoded.') from exc

def validate_pdf(file):
    if Path(file.name).suffix.lower() != '.pdf' or file.size > 10 * 1024 * 1024:
        raise ValidationError('Upload a PDF file no larger than 10 MB.')
    header = file.read(5)
    file.seek(0)
    if header != b'%PDF-':
        raise ValidationError('The uploaded file is not a valid PDF.')
