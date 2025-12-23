# Website

## Test Architecture

```mermaid
graph TD
    subgraph Local [Local Development]
        LT[Vitest: Unit Tests]
        LP[Playwright: UI & Counts]
    end

    subgraph Build [Full Build Process]
        AB[Astro Build]
        BA[Vitest: Artifact Check]
        BB[Playwright: 404 & Crawler]
    end

    Local --> AB
    AB --> Build
