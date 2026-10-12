#!/usr/bin/env python3
"""
Myra AI Dataset Bridge
Utilizes Hugging Face 'datasets' to fetch, process, and synchronize
technical interview, algorithmic, and career problem sets for Myra AI.
"""

import sys
import os
import json
import argparse
from typing import List, Dict, Any, Optional

try:
    import datasets
    from datasets import load_dataset, Dataset
except ImportError:
    print("Error: Hugging Face 'datasets' package not found. Run: py -m pip install datasets", file=sys.stderr)
    sys.exit(1)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "lib", "ai", "data")
DEFAULT_OUTPUT_FILE = os.path.join(OUTPUT_DIR, "myra-benchmark-dataset.json")

# Curated benchmark interview & reasoning examples for Myra AI
CURATED_REASONING_DATASET = [
    {
        "id": "ds-001",
        "category": "system_design",
        "topic": "Distributed Caching & Invalidation",
        "question": "How do you handle cache invalidation in a multi-region distributed system without creating thundering herd problems?",
        "ideal_approach": "Use Cache-Aside with probabilistic early expiration (XFetch algorithm) or lease-based locks. Distribute write-through events asynchronously via Kafka change-data-capture.",
        "difficulty": "senior",
        "edge_cases": ["Split-brain partition", "Clock drift on TTL", "Network partition between regions"]
    },
    {
        "id": "ds-002",
        "category": "algorithms",
        "topic": "Monotonic Stack / Next Greater Element",
        "question": "Given an array of temperatures, compute the number of days to wait until a warmer temperature. Optimize for linear time.",
        "ideal_approach": "Maintain a monotonically decreasing stack of indices. For each day, pop while current temperature exceeds stack top, calculating index distance in O(N) time and O(N) space.",
        "difficulty": "mid",
        "edge_cases": ["Strictly descending temperatures (never warms up)", "Duplicate consecutive temperatures"]
    },
    {
        "id": "ds-003",
        "category": "behavioral_star",
        "topic": "Conflict Resolution & Technical Disagreement",
        "question": "Describe a time you strongly disagreed with a senior engineer or architect regarding a technical decision. How did you resolve it?",
        "ideal_approach": "STAR format: Frame the disagreement around user impact and objective benchmarks rather than ego. Produce data/PoC metrics, seek common ground, and commit to the decided path (Disagree and Commit).",
        "difficulty": "mid",
        "edge_cases": ["Blaming colleagues", "Unresolved friction", "Lack of quantified metric in Result"]
    },
    {
        "id": "ds-004",
        "category": "concurrency",
        "topic": "Race Conditions & Optimistic Locking",
        "question": "How do you implement atomic balance transfers between accounts in PostgreSQL without deadlocks under 5,000 req/sec?",
        "ideal_approach": "Sort account IDs deterministically before acquiring row-level locks (SELECT ... FOR UPDATE) to eliminate circular deadlock conditions, or use version-based optimistic locking with exponential backoff retries.",
        "difficulty": "senior",
        "edge_cases": ["Circular lock acquisition order", "Transaction timeout on long retries", "Phantom reads"]
    }
]

def create_local_dataset() -> Dataset:
    """Builds a Hugging Face Dataset from curated Myra technical problems."""
    return Dataset.from_list(CURATED_REASONING_DATASET)

def export_for_myra(dataset: Dataset, destination_path: str = DEFAULT_OUTPUT_FILE) -> str:
    """Exports dataset records to JSON format consumed by Myra AI."""
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    records = dataset.to_list()
    
    payload = {
        "generator": "Hugging Face datasets library",
        "datasets_version": datasets.__version__,
        "record_count": len(records),
        "updated_at": "2026-10-05T20:15:00Z",
        "records": records
    }
    
    with open(destination_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        
    print(f"[Myra Dataset Bridge] Successfully exported {len(records)} benchmark records to {destination_path}")
    return destination_path

def main():
    parser = argparse.ArgumentParser(description="Myra AI Dataset Bridge using Hugging Face datasets")
    parser.add_argument("--export", action="store_true", help="Export dataset for Myra Next.js integration")
    parser.add_argument("--output", default=DEFAULT_OUTPUT_FILE, help="Target JSON destination path")
    parser.add_argument("--info", action="store_true", help="Print datasets library metadata")
    args = parser.parse_args()

    print(f"Hugging Face datasets version: {datasets.__version__}")
    
    ds = create_local_dataset()
    print(f"Loaded Myra benchmark dataset: {len(ds)} items")
    print(f"Features: {list(ds.features.keys())}")
    
    if args.export or True:
        out = export_for_myra(ds, args.output)
        print(f"Ready for Myra AI integration: {out}")

if __name__ == "__main__":
    main()
