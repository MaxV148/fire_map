FROM python:3.12-alpine

WORKDIR /app

# Install GCC and required build dependencies
RUN apk add --no-cache gcc musl-dev linux-headers

# Install GEOS library (Alpine equivalent of libgeos-dev)
RUN apk add --no-cache geos-dev

# Install uv
RUN pip install uv

COPY . .

# Install dependencies with uv
RUN uv sync

EXPOSE 8000

CMD ["uv", "run", "fastapi", "dev", "--host", "0.0.0.0", "--port", "8000"]