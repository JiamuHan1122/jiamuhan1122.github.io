# Jiamu Han — Academic Homepage

Personal academic website of **Jiamu Han**, built with [al-folio](https://github.com/alshedivat/al-folio), a Jekyll starter for academic websites.

🌐 **Website:** https://jiamuhan1122.github.io  
💻 **GitHub:** https://github.com/JiamuHan1122  
✉️ **Email:** jim_harmony@xauat.edu.cn

## About

I am a master's student in Intelligent Science and Technology at the School of Artificial Intelligence and Robotics, Xi'an University of Architecture and Technology. My research interests include video understanding, temporal action detection, action recognition, fine-grained 3D human interaction understanding, and robust multimodal learning.

## Local development

This site uses Jekyll and the al-folio v1.x plugin ecosystem.

```bash
bundle install
npm ci
bundle exec jekyll serve
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the site and publishes the generated `_site` directory to the `gh-pages` branch.

In **Settings → Pages**, configure the site to deploy from **gh-pages / root**.

## Attribution

This website is based on [alshedivat/al-folio](https://github.com/alshedivat/al-folio). The upstream project is distributed under the MIT License; see [LICENSE](LICENSE).
