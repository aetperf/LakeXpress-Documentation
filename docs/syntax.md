---
layout: default
title: Command Syntax Diagrams
---

# LakeXpress Command Syntax

Railroad diagrams showing the complete command-line syntax for LakeXpress.

## Complete Command Syntax

The main command structure and variations.

### Main Command Structure

![Main Command Structure]({{ '/assets/images/diagrams/Syntax.png' | relative_url }})

### LakeXpress Command

![LakeXpress Command]({{ '/assets/images/diagrams/LakeXpressCommand.png' | relative_url }})

## Command Types

LakeXpress supports several command types:

### Normal Export Command

![Normal Export Command]({{ '/assets/images/diagrams/NormalExportCommand.png' | relative_url }})

### Initialize Database Command

![Initialize Database Command]({{ '/assets/images/diagrams/InitDbCommand.png' | relative_url }})

### Resume Command

![Resume Command]({{ '/assets/images/diagrams/ResumeCommand.png' | relative_url }})

### Metadata Generation Command

![Metadata Command]({{ '/assets/images/diagrams/MetadataCommand.png' | relative_url }})

### Version Command

![Version Command]({{ '/assets/images/diagrams/VersionCommand.png' | relative_url }})

## Core Components

Required and optional components for export commands.

### Authentication

![Core Authentication]({{ '/assets/images/diagrams/CoreAuthentication.png' | relative_url }})

### License Options

![License Options]({{ '/assets/images/diagrams/LicenseOptions.png' | relative_url }})

## Database Configuration

### Source Database

![Source Database]({{ '/assets/images/diagrams/SourceDatabase.png' | relative_url }})

### Log Database Mode

![Log Database Mode]({{ '/assets/images/diagrams/LogDbMode.png' | relative_url }})

![Log Level]({{ '/assets/images/diagrams/LogLevel.png' | relative_url }})

### Initialize Database Options

![Initialize Database Options]({{ '/assets/images/diagrams/InitDbOptions.png' | relative_url }})

## Table Filtering

How to select and filter tables for export.

### Table Filtering Overview

![Table Filtering]({{ '/assets/images/diagrams/TableFiltering.png' | relative_url }})

### Include Pattern

![Include Pattern]({{ '/assets/images/diagrams/IncludePattern.png' | relative_url }})

### Exclude Pattern

![Exclude Pattern]({{ '/assets/images/diagrams/ExcludePattern.png' | relative_url }})

## FastBCP Configuration

Performance tuning and FastBCP options.

### FastBCP Configuration

![FastBCP Configuration]({{ '/assets/images/diagrams/FastBCPConfiguration.png' | relative_url }})

### FastBCP Optional Options

![FastBCP Optional Options]({{ '/assets/images/diagrams/FastBCPOptionalOptions.png' | relative_url }})

### Execution Control

![Execution Control]({{ '/assets/images/diagrams/ExecutionControl.png' | relative_url }})

## Output Destinations

Storage configuration for exported data.

### Output Destination

![Output Destination]({{ '/assets/images/diagrams/OutputDestination.png' | relative_url }})

### Filesystem Output

![Filesystem Output]({{ '/assets/images/diagrams/FilesystemOutput.png' | relative_url }})

### Cloud Storage Output

![Cloud Storage Output]({{ '/assets/images/diagrams/CloudStorageOutput.png' | relative_url }})

## Metadata Generation

CDM metadata generation options.

### Metadata Options

![Metadata Options]({{ '/assets/images/diagrams/MetadataOptions.png' | relative_url }})

### Metadata Detail Options

![Metadata Detail Options]({{ '/assets/images/diagrams/MetadataDetailOptions.png' | relative_url }})

## Logging

Logging configuration options.

### Logging Options

![Logging Options]({{ '/assets/images/diagrams/LoggingOptions.png' | relative_url }})

## Understanding Railroad Diagrams

Railroad diagrams (also called syntax diagrams) provide a visual representation of command syntax:

- **Lines**: Follow the path from left to right
- **Rectangles**: Required or optional keywords/values
- **Ovals**: Literal text you must type
- **Branches**: Alternative options - choose one path
- **Loops**: Items that can be repeated
- **Arrows**: Show the direction of flow

### Example

In the diagram, if you see a path that loops back, it means that option can be specified multiple times.

## See Also

- [CLI Reference]({{ '/cli-reference' | relative_url }}) - Detailed description of all options
- [Command Builder]({{ '/command-builder' | relative_url }}) - Interactive command generator
- [Examples]({{ '/examples' | relative_url }}) - Real-world usage examples
