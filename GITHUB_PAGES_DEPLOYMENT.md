# GitHub Pages Deployment Guide

This guide explains how to deploy the LakeXpress documentation to GitHub Pages.

## Prerequisites

- Git repository hosted on GitHub
- Push access to the repository
- Basic familiarity with Jekyll

## Deployment Steps

### 1. Configure GitHub Pages

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Pages**
3. Under **Source**, select:
   - **Branch:** `main` (or your default branch)
   - **Folder:** `/docs`
4. Click **Save**

### 2. Verify Configuration

GitHub Pages will automatically:
- Detect the Jekyll configuration in `/docs`
- Build the site using Jekyll 4.x
- Deploy to `https://USERNAME.github.io/LakeXpress-Documentation/`

The deployment process typically takes 1-2 minutes.

### 3. Check Deployment Status

1. Go to **Actions** tab in your GitHub repository
2. Look for the "pages build and deployment" workflow
3. Verify the deployment succeeded (green checkmark)

## Local Development

### Install Dependencies

First time setup:

```bash
cd docs
bundle install
```

### Run Local Server

```bash
cd docs
bundle exec jekyll serve
```

Then open: `http://localhost:4000/LakeXpress-Documentation/`

### Watch for Changes

Jekyll automatically rebuilds when you modify files. Refresh your browser to see changes.

## Troubleshooting

### Build Failures

**Check the Actions log:**
1. Go to **Actions** tab
2. Click on the failed workflow
3. Review error messages

**Common issues:**

1. **Invalid YAML front matter**
   - Ensure all `.md` files have valid front matter
   - Check for syntax errors in `_config.yml`

2. **Missing dependencies**
   - Verify all gems are listed in `Gemfile`
   - Check that Jekyll version is compatible

3. **Broken links**
   - Use `relative_url` filter for all internal links
   - Example: `{{ '/quickstart' | relative_url }}`

### Page Not Found (404)

**Check baseurl configuration:**

In `docs/_config.yml`:
```yaml
baseurl: "/LakeXpress-Documentation"  # Must match repository name
```

**Verify navigation links:**

All links should use the `relative_url` filter:
```markdown
[Quick Start]({{ '/quickstart' | relative_url }})
```

### Images Not Loading

**Ensure correct paths:**

```markdown
![Logo]({{ '/assets/images/LX.jpg' | relative_url }})
```

**Verify files exist:**
```bash
ls docs/assets/images/LX.jpg
ls docs/assets/images/diagrams/*.png
```

### CSS Not Applied

**Check stylesheet links in layout:**

`docs/_layouts/default.html`:
```html
<link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
```

**Verify CSS files exist:**
```bash
ls docs/assets/css/style.css
ls docs/assets/css/railroad.css
```

## Updating the Documentation

### 1. Make Changes Locally

```bash
# Edit documentation files
vim docs/quickstart.md

# Test locally
cd docs
bundle exec jekyll serve
```

### 2. Commit and Push

```bash
git add docs/
git commit -m "Update quick start guide"
git push origin main
```

### 3. Verify Deployment

1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Visit your site: `https://USERNAME.github.io/LakeXpress-Documentation/`
3. Verify changes appear correctly

## Custom Domain (Optional)

### Configure Custom Domain

1. **Add CNAME record** in your DNS:
   ```
   docs.yourdomain.com  CNAME  USERNAME.github.io
   ```

2. **Update GitHub Pages settings:**
   - Go to **Settings** > **Pages**
   - Enter your custom domain: `docs.yourdomain.com`
   - Check "Enforce HTTPS"

3. **Update baseurl** in `docs/_config.yml`:
   ```yaml
   url: "https://docs.yourdomain.com"
   baseurl: ""  # Empty for custom domain
   ```

## Version Updates

### Updating LakeXpress Version

Edit `docs/_data/version.yml`:

```yaml
lakexpress_version: 0.2.0  # Update this
documentation_version: 1.0.0
last_updated: 2025-11-01  # Update this
```

The version badge in the navigation will update automatically.

## Maintenance

### Regular Tasks

1. **Update version numbers** when LakeXpress releases new versions
2. **Review and update examples** to reflect latest features
3. **Check for broken links** periodically
4. **Update screenshots** if UI changes

### Backup

The documentation is version-controlled in Git, so:
- All changes are tracked in commit history
- Previous versions can be restored if needed
- Multiple team members can contribute

## CI/CD Integration (Advanced)

### GitHub Actions for Testing

Create `.github/workflows/jekyll-check.yml`:

```yaml
name: Jekyll Build Check

on:
  pull_request:
    paths:
      - 'docs/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.0
      - name: Install dependencies
        run: |
          cd docs
          bundle install
      - name: Build Jekyll site
        run: |
          cd docs
          bundle exec jekyll build
```

This checks that the site builds successfully on every pull request.

## Support

### Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Minima Theme](https://github.com/jekyll/minima)

### Common Commands

```bash
# Install/update dependencies
bundle install
bundle update

# Build site
bundle exec jekyll build

# Serve locally
bundle exec jekyll serve

# Serve with drafts
bundle exec jekyll serve --drafts

# Clean build artifacts
bundle exec jekyll clean
```

## Security

### Best Practices

1. **No secrets in documentation**
   - Never commit credentials or API keys
   - Use placeholder values in examples

2. **Review external links**
   - Verify external links are safe
   - Update broken or outdated links

3. **Keep dependencies updated**
   ```bash
   bundle update
   git add Gemfile.lock
   git commit -m "Update dependencies"
   ```

## Conclusion

Your LakeXpress documentation is now deployed to GitHub Pages! The site will automatically rebuild whenever you push changes to the repository.

**Live Site:** `https://USERNAME.github.io/LakeXpress-Documentation/`

For questions or issues with deployment, check the GitHub Pages documentation or open an issue in the repository.
