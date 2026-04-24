# OEPS Project Mindmap

This folder contains a structured, visualization-friendly architecture map of the **Online Examination and Proctoring System (OEPS)**.

Latest synced change: `chg-006` — question-bank folder open flow, exam question assignment refresh, async serializer hardening, and dashboard SF Symbol icon mapping.

## File Reference

| File | Purpose |
|------|---------|
| `project-mindmap.json` | **Source of truth** — full graph with nodes, edges, groups, metadata |
| `project-mindmap.mmd` | Mermaid diagram for quick visual rendering |
| `node-index.json` | Flat lookup table of all nodes (ID → title, type, files, tags) |
| `change-log.json` | Chronological record of every change and its impacted nodes |
| `snapshots/` | Historical JSON snapshots after major changes |

## How the Node/Edge System Works

### Nodes
Each node represents a discrete piece of the project architecture:
- **`id`** — stable unique identifier (never changes once assigned)
- **`type`** — one of: `project`, `module`, `feature`, `screen`, `component`, `model`, `service`, `utility`, `flow`, `config`, `theme`
- **`parent_id`** — hierarchy link to parent node
- **`files`** — actual source files this node represents
- **`tags`** — searchable labels
- **`status`** — `stable`, `in-progress`, or `incomplete`
- **`change_in_progress`** — boolean flag (see below)
- **`needs_review`** — true if understanding is uncertain

### Edges
Each edge represents a relationship between two nodes:
- **`from` / `to`** — node IDs
- **`relationship`** — one of: `contains`, `depends_on`, `uses`, `reads_from`, `writes_to`, `navigates_to`, `configures`, `related_to`
- **`label`** — human-readable description
- **`direction`** — always `forward` (from → to)

### Groups
Logical groupings for visualization purposes (e.g., "Data Layer", "UI Layer"). Each group lists its member `node_ids`.

## How `change_in_progress` Works

This boolean flag tracks active modifications at three levels:

1. **Root level** (`project-mindmap.json` → `change_in_progress`) — true when ANY change is active
2. **Node level** — true on each node being modified
3. **Edge level** — true on each edge being affected

### Workflow:
1. Before starting work: set `change_in_progress: true` on all affected items
2. Perform the implementation
3. Update this mindmap to reflect the change
4. Set all completed items back to `change_in_progress: false`
5. **Never** leave completed work marked as `true`

## How to Visualize

### Mermaid (Quickest)
Open `project-mindmap.mmd` in any Mermaid-compatible viewer:
- [Mermaid Live Editor](https://mermaid.live)
- VS Code with Mermaid extension
- GitHub (renders `.mmd` files natively in markdown)

### From JSON (Advanced)
The `project-mindmap.json` follows a `nodes + edges` graph format compatible with:
- **D3.js** force-directed or hierarchical layouts
- **React Flow** / **Cytoscape.js** interactive graph visualizers
- **Obsidian** graph view (convert nodes to linked markdown files)
- **Graphviz** (convert edges to DOT format)
- **vis.js** network visualization

### Regenerating Mermaid from JSON
Parse `nodes` and `edges` from JSON:
```python
# Pseudocode
for node in nodes:
    print(f'    {node.id}["{node.title}"]')
for edge in edges:
    print(f'    {edge.from} -->|{edge.relationship}| {edge.to}')
```

## How to Inspect Impact During Future Work

1. **Identify the file(s)** being changed
2. **Search `node-index.json`** by filename to find affected node IDs
3. **Search `project-mindmap.json` edges** for all edges touching those node IDs
4. **Trace transitive dependencies** by following edge chains
5. **Check `open_questions`** in the JSON for known fragile areas

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Nodes | 44 |
| Total Edges | 76 |
| Groups | 9 |
| Backend Files | ~35 |
| Frontend Files | ~15 |
| Data Models | 12 tables |
| API Endpoints | ~45 |
| Frontend Screens | 4 |
| Open Questions | 6 |
