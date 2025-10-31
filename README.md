# LakeXpress Documentation

Official documentation for [LakeXpress](https://github.com/aetperf/LakeXpress) - a fast database-to-parquet export tool with multi-cloud object storage support.

**Live Documentation:** [https://aetperf.github.io/LakeXpress-Documentation/](https://aetperf.github.io/LakeXpress-Documentation/)

## About

This repository contains the source for the LakeXpress documentation website, built with Jekyll and deployed via GitHub Pages.

## Documentation Structure

```
docs/
├── _config.yml              # Jekyll configuration
├── _layouts/                # Custom layouts
│   └── default.html        # Main layout template
├── _data/                   # Data files
│   └── version.yml         # Version information
├── assets/                  # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript
│   └── images/             # Images and diagrams
├── index.md                # Homepage
├── quickstart.md           # Quick start guide
├── cli-reference.md        # CLI documentation
├── syntax.md               # Syntax diagrams
├── command-builder.md      # Interactive command builder
├── storage-backends.md     # Storage configuration
├── database-configuration.md # Database setup
├── fastbcp-configuration.md # FastBCP tuning
├── examples.md             # Real-world examples
└── troubleshooting.md      # Troubleshooting guide
```

## Local Development

### Prerequisites

- Ruby 2.7 or higher
- Bundler: `gem install bundler`

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aetperf/LakeXpress-Documentation.git
   cd LakeXpress-Documentation
   ```

2. Install dependencies:
   ```bash
   cd docs
   bundle install
   ```

3. Run local server:
   ```bash
   bundle exec jekyll serve
   ```

4. Open browser to [http://localhost:4000/LakeXpress-Documentation/](http://localhost:4000/LakeXpress-Documentation/)

### Making Changes

1. Edit documentation files in `docs/`
2. Jekyll will automatically rebuild when files change
3. Refresh browser to see changes
4. Commit and push to deploy to GitHub Pages

## Contributing

### Adding New Pages

1. Create new `.md` file in `docs/`
2. Add front matter:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   ---
   ```
3. Add to navigation in `docs/_config.yml`:
   ```yaml
   header_pages:
     - your-new-page.md
   ```
4. Update navigation in `docs/_layouts/default.html`

### Updating Version

Edit `docs/_data/version.yml`:
```yaml
lakexpress_version: X.Y.Z  # Update this
documentation_version: 1.0.0
last_updated: YYYY-MM-DD   # Update this
```

### Adding Railroad Diagrams

1. Generate diagrams from EBNF using `tools/ebnf_to_railroad_js.py`
2. Save PNG files to `docs/assets/images/diagrams/`
3. Reference in documentation:
   ```markdown
   ![Diagram Title]({{ '/assets/images/diagrams/YourDiagram.png' | relative_url }})
   ```

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

See [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md) for detailed deployment instructions.

## Maintenance

### Regular Updates

- Update version numbers when LakeXpress releases new versions
- Review examples to ensure they reflect latest features
- Check for broken links periodically
- Update screenshots if UI changes

### Useful Commands

```bash
# Install/update dependencies
bundle install
bundle update

# Build site
bundle exec jekyll build

# Serve locally
bundle exec jekyll serve

# Clean build artifacts
bundle exec jekyll clean
```

## Project References

- **LakeXpress Source:** [github.com/aetperf/LakeXpress](https://github.com/aetperf/LakeXpress)
- **FastBCP:** [arpe.io/fastbcp](https://www.arpe.io/fastbcp/)
- **Documentation Site:** [aetperf.github.io/LakeXpress-Documentation](https://aetperf.github.io/LakeXpress-Documentation/)

## License

This documentation is part of the LakeXpress project.

## Support

- **Issues:** [GitHub Issues](https://github.com/aetperf/LakeXpress/issues)
- **Documentation Issues:** [Documentation Issues](https://github.com/aetperf/LakeXpress-Documentation/issues)

---

Built with [Jekyll](https://jekyllrb.com/) • Hosted on [GitHub Pages](https://pages.github.com/) • Theme: [Minima](https://github.com/jekyll/minima)
