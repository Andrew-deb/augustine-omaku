"""
One-time script to seed the 6 existing sessions into Supabase.

Usage:
    cd backend
    venv\Scripts\activate
    python seed_sessions.py
"""

import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.db import AsyncSessionLocal, engine
from app.models import Session, SessionPlatform, SessionStatus


SESSIONS = [
    {
        "code": "azure-bronze-gold",
        "category": "Azure",
        "title": "Azure Data Fundamentals: From Bronze to Gold",
        "short_desc": "Learn the layered architecture pattern that powers modern data lakes on Azure.",
        "long_desc": "A practical walk-through of the medallion architecture (Bronze → Silver → Gold) on Azure. We will cover ingestion patterns, transformations with Databricks/Synapse, governance, and how to expose curated datasets to BI tools.",
        "audience": "Data engineers and analysts new to Azure",
        "learn_points": [
            "Medallion architecture end-to-end",
            "Azure Data Lake & Synapse setup",
            "Data quality patterns",
        ],
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80",
        "status": SessionStatus.OPEN,
        "capacity": 50,
        "starts_at": datetime(2026, 4, 15, 19, 0, tzinfo=timezone.utc),  # 2:00 PM EST = 7:00 PM UTC
        "duration_minutes": 90,
        "timezone": "EST",
        "platform": SessionPlatform.ZOOM,
        "is_active": True,
    },
    {
        "code": "powerbi-fabric",
        "category": "Power BI",
        "title": "Power BI & Fabric: Building Self-Service Analytics",
        "short_desc": "Enable your teams with self-service BI using Power BI and Microsoft Fabric.",
        "long_desc": "Design semantic models, dataflows, and governed self-service experiences across Power BI and Fabric. Includes RLS, certification, and lifecycle workflows.",
        "audience": "BI developers, analytics leads",
        "learn_points": [
            "Semantic model best practices",
            "Dataflows Gen2",
            "Workspace governance",
        ],
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
        "status": SessionStatus.LIMITED,
        "capacity": 50,
        "starts_at": datetime(2026, 4, 22, 18, 0, tzinfo=timezone.utc),  # 1:00 PM EST
        "duration_minutes": 75,
        "timezone": "EST",
        "platform": SessionPlatform.TEAMS,
        "is_active": True,
    },
    {
        "code": "streaming-realtime",
        "category": "Streaming",
        "title": "Real-Time Analytics & Streaming: Minutes Not Hours",
        "short_desc": "Build hybrid batch-stream systems that deliver insights in real time.",
        "long_desc": "Architect Kafka/Event Hubs + stream processing pipelines that complement batch warehouses. Discusses windowing, exactly-once, and serving layers.",
        "audience": "Senior data engineers",
        "learn_points": [
            "Streaming architectures",
            "Windowing & state",
            "Lambda vs Kappa",
        ],
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
        "status": SessionStatus.SOLDOUT,
        "capacity": 50,
        "starts_at": datetime(2026, 5, 5, 21, 0, tzinfo=timezone.utc),  # 4:00 PM EST
        "duration_minutes": 90,
        "timezone": "EST",
        "platform": SessionPlatform.ZOOM,
        "is_active": True,
    },
    {
        "code": "data-quality",
        "category": "Data Quality",
        "title": "Data Quality & Governance Frameworks That Actually Work",
        "short_desc": "Build automated quality checks and governance patterns that become part of your DNA.",
        "long_desc": "Operationalize data quality with Great Expectations, dbt tests, and contract-driven pipelines. Includes a practical governance rollout playbook.",
        "audience": "Data platform & governance teams",
        "learn_points": [
            "Quality test pyramids",
            "Data contracts",
            "Governance rollout",
        ],
        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80",
        "status": SessionStatus.OPEN,
        "capacity": 40,
        "starts_at": datetime(2026, 5, 20, 19, 30, tzinfo=timezone.utc),  # 2:30 PM EST
        "duration_minutes": 120,
        "timezone": "EST",
        "platform": SessionPlatform.GOOGLE_MEET,
        "is_active": True,
    },
    {
        "code": "fabric-deepdive",
        "category": "Fabric",
        "title": "Microsoft Fabric Deep Dive: Unified Analytics at Scale",
        "short_desc": "Explore the unified analytics platform that brings everything together.",
        "long_desc": "Microsoft Fabric unifies data engineering, analytics, and BI into one cohesive platform. In this session, we will explore Fabric's lakehouse architecture, how it simplifies your data stack, and how to migrate from legacy systems. Includes Q&A and real-world case study examples.",
        "audience": "Managers, architects, engineers considering Fabric adoption",
        "learn_points": [
            "Understand Fabric's unified lakehouse architecture",
            "Plan a migration strategy from legacy platforms",
            "Operate OneLake, Data Factory, and Power BI together",
        ],
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
        "status": SessionStatus.OPEN,
        "capacity": 75,
        "starts_at": datetime(2026, 6, 10, 20, 0, tzinfo=timezone.utc),  # 3:00 PM EST
        "duration_minutes": 90,
        "timezone": "EST",
        "platform": SessionPlatform.TEAMS,
        "is_active": True,
    },
    {
        "code": "production-pipelines",
        "category": "Engineering",
        "title": "Building Production Data Pipelines: Reliability at Scale",
        "short_desc": "Master ETL/ELT patterns that handle millions of records daily with 99.9% reliability.",
        "long_desc": "A look at orchestration, observability, retries, idempotency, and SLOs for production-grade pipelines. Real war stories included.",
        "audience": "Senior engineers, tech leads",
        "learn_points": [
            "Orchestration patterns",
            "Observability & SLOs",
            "Idempotent design",
        ],
        "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
        "status": SessionStatus.COMINGSOON,
        "capacity": 60,
        "starts_at": datetime(2026, 7, 8, 18, 0, tzinfo=timezone.utc),  # 1:00 PM EST
        "duration_minutes": 90,
        "timezone": "EST",
        "platform": SessionPlatform.ZOOM,
        "is_active": True,
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for session_data in SESSIONS:
            # Check if session already exists (idempotent)
            result = await db.execute(
                select(Session).where(Session.code == session_data["code"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  ⏭  Skipped (exists): {session_data['code']}")
                continue

            session = Session(**session_data)
            db.add(session)
            print(f"  ✅ Created: {session_data['code']}")

        await db.commit()

    await engine.dispose()
    print("\n🎉 Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())