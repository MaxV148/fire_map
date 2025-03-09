FROM python:3.12-alpine

WORKDIR /app

# Install GCC and required build dependencies
RUN apk add --no-cache gcc musl-dev linux-headers

# Install GEOS library (Alpine equivalent of libgeos-dev)
RUN apk add --no-cache geos-dev

COPY . .

RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
