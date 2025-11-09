---
type: architecture
project: mem-totems
---

# 🏗️ System Architecture

## Overview
Spirit Trails follows a **modular client-driven architecture** built for extensibility and AI-assisted generation.  
Primary technologies: **TypeScript + Phaser 3**, JSON assets, and a lightweight cloud sync layer for persistence.

## High-Level Components

frontend/
├── ui/
├── gameplay/
│    ├── tilemap/
│    ├── combat/
│    ├── essence/
│    └── companion/
├── audio/
└── effects/
backend/
├── save-service/
├── analytics/
└── content-api/

## Data Flow
1. **Frontend runtime** handles gameplay loops (tilemap, combat, essence).  
2. **Backend (optional)** stores player progress and essence economy via Supabase or Firebase.  
3. **AI Agents (Copilot / LLM)** read Markdown specs for code generation and testing tasks.  

## Services
- **Save Service:** Sync local progress → cloud JSON.  
- **Analytics:** Log run stats, creature usage, essence collected.  
- **Content API:** Serves procedural map seeds and event text.  

## Design Patterns
- **Entity–Component–System (ECS)** for game entities.  
- **Event Bus** for decoupled module communication (`onEssenceCollected`, `onCompanionAbilityUsed`).  
- **State Machines** for run flow and combat phases.  

## Future Integration
- Plugin-based “Extension Packs” for new biomes or essence types.  
- AI-assisted content creation: Copilot agents auto-generate tilemaps and new creature data.