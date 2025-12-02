# Contributing to Autoworld Workleto n8n Integration

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- n8n instance (self-hosted or cloud)
- Shopify store with API access
- Apify account with dataset access
- Git installed locally
- Basic knowledge of JavaScript/Python
- Understanding of n8n workflows

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/n8n-autoworld_workleto.git
   cd n8n-autoworld_workleto
   ```

2. **Review documentation**
   - Read [INDEX.md](INDEX.md) for navigation
   - Review [QUICK_START.md](QUICK_START.md) for setup
   - Study [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) for architecture

3. **Import workflow to development n8n**
   - Use `ATW_WKT_Live-OPTIMIZED.json`
   - Configure with test credentials
   - Test with small dataset first

## 🔧 How to Contribute

### Types of Contributions

We welcome:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **Code refactoring**
- 🧪 **Test additions**
- 💡 **Ideas and suggestions**

### Reporting Bugs

**Before submitting:**
1. Check existing issues
2. Test with latest version
3. Verify it's not a configuration issue

**Bug report should include:**
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- n8n version
- Workflow version
- Execution logs (sanitized)
- Screenshots if applicable

**Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- n8n version: X.X.X
- Workflow version: X.X
- Node.js version: X.X.X

**Logs:**
```
Relevant log excerpts
```

**Screenshots:**
[If applicable]
```

### Suggesting Enhancements

**Enhancement suggestions should include:**
- Clear use case
- Expected benefits
- Potential implementation approach
- Impact on existing functionality

**Template:**
```markdown
**Feature Request:**
Clear title

**Problem:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches you've thought about

**Benefits:**
- Benefit 1
- Benefit 2

**Implementation Notes:**
Technical considerations
```

## 🔄 Development Workflow

### Branching Strategy

```
main (production-ready)
  ├── develop (integration branch)
  │   ├── feature/feature-name
  │   ├── bugfix/bug-name
  │   └── enhancement/enhancement-name
  └── hotfix/critical-fix
```

### Branch Naming

- **Features:** `feature/short-description`
- **Bug fixes:** `bugfix/issue-number-description`
- **Enhancements:** `enhancement/short-description`
- **Hotfixes:** `hotfix/critical-issue`
- **Documentation:** `docs/what-changed`

**Examples:**
```bash
feature/add-webhook-trigger
bugfix/123-fix-duplicate-skus
enhancement/improve-error-handling
hotfix/critical-api-timeout
docs/update-quick-start
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test thoroughly**
   - Test with small dataset (10 items)
   - Test with medium dataset (100 items)
   - Test error scenarios
   - Verify no regressions

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

## 🧪 Testing Guidelines

### Before Submitting

**Required Tests:**

1. **Unit Tests** (for Code nodes)
   - Test with valid data
   - Test with invalid data
   - Test edge cases

2. **Integration Tests**
   - Test full workflow execution
   - Test with real API calls (development environment)
   - Verify data integrity

3. **Performance Tests**
   - Test with 10, 50, 100, 200 items
   - Measure execution time
   - Check memory usage

### Test Checklist

- [ ] Workflow executes successfully
- [ ] No errors in execution logs
- [ ] Data transformed correctly
- [ ] SKU matching works
- [ ] Deduplication works
- [ ] Price updates work
- [ ] Metafields populated
- [ ] Error handling works
- [ ] Retry logic works
- [ ] Performance acceptable
- [ ] Documentation updated

### Test Data

Use sanitized test data:
```javascript
// Good - test data
{
  "sku": "TEST-001",
  "price": "100.00",
  "title": "Test Product"
}

// Bad - production data
{
  "sku": "REAL-SKU-123",
  "price": "49999.00",
  "title": "Real Customer Product"
}
```

## 📚 Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Fix bugs that affect usage
- Improve performance significantly
- Add configuration options

### Documentation Files to Update

| Change Type | Files to Update |
|-------------|----------------|
| **New feature** | README.md, OPTIMIZATION_REPORT.md |
| **Configuration** | README.md, QUICK_START.md |
| **Bug fix** | CHANGELOG.md (create if needed) |
| **Performance** | COMPARISON.md, OPTIMIZATION_REPORT.md |
| **Architecture** | OPTIMIZATION_REPORT.md |

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update table of contents
- Check for broken links

## 💬 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

**Good commits:**
```bash
feat(filter): add advanced SKU normalization

Implement Unicode normalization and zero-width character removal
to improve SKU matching accuracy from 94% to 99.8%.

Closes #123

---

fix(price): prevent unnecessary price updates

Add 1 cent tolerance to price comparison to avoid updates
due to rounding differences. Reduces API calls by 97%.

Fixes #456

---

docs(readme): update monitoring section

Add new performance metrics and troubleshooting steps
based on user feedback.

---

perf(filter): optimize deduplication logic

Use Map instead of Array for O(1) lookups, reducing
filter execution time by 60%.
```

**Bad commits:**
```bash
fixed stuff
update
changes
wip
asdf
```

### Commit Message Rules

1. Use present tense ("add" not "added")
2. Use imperative mood ("move" not "moves")
3. Limit first line to 72 characters
4. Reference issues/PRs when applicable
5. Explain **what** and **why**, not **how**

## 🔀 Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run final tests**
   - Execute workflow manually
   - Check all test cases
   - Review execution logs

3. **Update documentation**
   - Update relevant docs
   - Add/update examples
   - Check formatting

4. **Self-review**
   - Review your own changes
   - Check for debug code
   - Verify no secrets committed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Documentation
- [ ] Performance improvement

## Testing
- [ ] Tested with 10 items
- [ ] Tested with 100 items
- [ ] Tested error scenarios
- [ ] No regressions found

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No console.log/debug code
- [ ] Tests pass
- [ ] No breaking changes (or documented)

## Screenshots
[If applicable]

## Related Issues
Closes #123
Relates to #456
```

### Review Process

1. **Automated checks** (if configured)
   - Linting
   - Basic validation

2. **Manual review**
   - Code quality
   - Logic correctness
   - Documentation completeness
   - Test coverage

3. **Testing**
   - Reviewer tests changes
   - Verifies no regressions

4. **Approval**
   - At least 1 approval required
   - All comments addressed

5. **Merge**
   - Squash and merge (preferred)
   - Merge commit (for features)
   - Rebase (for clean history)

### After Merge

1. **Delete branch**
   ```bash
   git branch -d your-branch
   git push origin --delete your-branch
   ```

2. **Update local main**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Close related issues**
   - Reference PR in issue
   - Verify fix works

## 🎨 Code Style

### JavaScript/Node.js

```javascript
// Good
const normalizeSKU = (raw) => {
  if (raw == null) return '';
  return String(raw)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toUpperCase();
};

// Bad
function normalizeSKU(raw){
    if(!raw)return '';
    return raw.toUpperCase().trim()
}
```

### Python

```python
# Good
def transform_item(item: dict) -> dict:
    """Transform car item to Shopify format."""
    row = {}
    title = item.get('title') or ''
    return row

# Bad
def transform_item(item):
    row={}
    title=item['title']
    return row
```

### General Guidelines

- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use consistent formatting
- Follow existing patterns

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH**
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `1.2.3`

## 📞 Getting Help

### Resources

- **Documentation:** Start with [INDEX.md](INDEX.md)
- **Issues:** Check existing issues first
- **Discussions:** Use GitHub Discussions for questions

### Questions?

- 💬 Open a GitHub Discussion
- 🐛 Report bugs via Issues
- 💡 Suggest features via Issues
- 📧 Contact maintainers (if urgent)

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📚 Documentation improvements
- 🔧 Code contributions
- 💬 Community support

**Happy Contributing! 🚀**

---

**Last Updated:** December 2, 2024  
**Version:** 1.0

