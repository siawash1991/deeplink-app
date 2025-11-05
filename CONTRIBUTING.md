# 🤝 Contributing to Deep Link Shortener

First off, thank you for considering contributing to Deep Link Shortener! It's people like you that make this project such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding New Platforms](#adding-new-platforms)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful** and inclusive of differing viewpoints and experiences
- **Use welcoming and inclusive language**
- **Accept constructive criticism gracefully**
- **Focus on what is best** for the community
- **Show empathy** towards other community members

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

### 💡 Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case** for the feature
- **Expected behavior** and benefits
- **Possible implementation** approach (optional)
- **Mockups or examples** if applicable

### 🔧 Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Commit your changes with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 14+
- MongoDB
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/deep-link-shortener.git
   cd deep-link-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo

   # Or start your local MongoDB
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated and all passing
- [ ] No console warnings or errors
- [ ] Commit messages are clear and descriptive

### PR Guidelines

1. **Title**: Use a clear, descriptive title
   - ✅ `Add Spotify deep linking support`
   - ❌ `Update files`

2. **Description**: Include:
   - What changes were made
   - Why these changes were necessary
   - Any breaking changes
   - Screenshots (for UI changes)

3. **Size**: Keep PRs focused and reasonably sized
   - Large changes should be discussed in an issue first

4. **Reviews**: Address all review comments
   - Be open to feedback
   - Explain your reasoning when disagreeing

## Coding Standards

### JavaScript Style

- Use **ES6+** features
- Use **async/await** over callbacks
- Use **descriptive variable names**
- Follow **existing code style**

### File Organization

```
src/
├── models/       # Database models
├── routes/       # Express routes
├── utils/        # Utility functions
└── config/       # Configuration files
```

### Comments

- Use JSDoc for functions
- Add inline comments for complex logic
- Keep comments up to date

Example:
```javascript
/**
 * Detect platform from URL
 * @param {string} url - URL to analyze
 * @returns {Object|null} Platform info or null
 */
function detectPlatform(url) {
  // Implementation...
}
```

### Error Handling

Always handle errors appropriately:

```javascript
try {
  // Code that might fail
} catch (error) {
  console.error('Descriptive error message:', error);
  // Handle error appropriately
}
```

### Testing

- Write tests for new features
- Update tests for changed functionality
- Aim for good coverage
- Use descriptive test names

```javascript
describe('detectPlatform', () => {
  it('should detect YouTube URLs correctly', () => {
    // Test implementation
  });
});
```

## Adding New Platforms

Want to add support for a new platform? Follow these steps:

1. **Update `src/utils/deeplink.js`**:
   ```javascript
   const platforms = {
     // Existing platforms...

     spotify: {
       regex: /spotify\.com\/track\/([\w]+)/,
       deepLinkTemplate: (trackId) => `spotify://track/${trackId}`,
       fallback: (trackId) => `https://open.spotify.com/track/${trackId}`
     }
   };
   ```

2. **Add tests** in `tests/deeplink.test.js`

3. **Update documentation**:
   - README.md
   - API.md
   - CHANGELOG.md

4. **Test thoroughly**:
   - Test on iOS
   - Test on Android
   - Test on Desktop

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
Type: Short description (50 chars max)

Longer explanation if needed (wrap at 72 chars).

- Bullet points are okay
- Use present tense ("Add feature" not "Added feature")
- Reference issues and PRs liberally

Fixes #123
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Questions?

Feel free to:
- Open an issue for questions
- Join our discussions
- Email the maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

---

Thank you for contributing! 🎉
