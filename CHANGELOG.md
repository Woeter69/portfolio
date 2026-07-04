# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-05

### Added
- **Interactive Terminal Command System**: Overhauled `TypewriterTerminal.tsx` to feature a functional terminal interface supporting commands (`help`, `about`, `skills`, `projects`, `contact`, `clear`, `exit`) when the user interacts with the typewriter.
- **Mechanical Typewriter Physics & Animations**: Added tactile keystroke animations including physical key depression, realistic key tilt, striking typebar animation, and carriage return acoustics/visuals.
- **Two-Stage Cinematic Sitting Animation**: Implemented a smooth two-stage camera transition in `ScrollWrapper.tsx` that glides the player to a standing position in front of the chair before lowering them down into a seated typing position.
- **Warm Typography & Lighting**: Upgraded typewriter interface font to Google Fonts `Outfit`, added a warm glowing cursor, and integrated ambient desk illumination.

### Fixed
- **Camera Facing Direction at Typewriter**: Corrected camera orientation when seated at the typewriter desk in `ScrollWrapper.tsx`. The camera now sits in the chair position (`chairStandPos`: `[1.85, -42.1, -23.55]`, `typingSeatPos`: `[1.85, -42.52, -23.28]`) and directs its look-at vector onto the desk (`targetLook`: `[1.85, -42.00, -23.85]`), calibrated to lower the gaze from the ceiling/sky directly onto the typewriter keyboard and paper.
