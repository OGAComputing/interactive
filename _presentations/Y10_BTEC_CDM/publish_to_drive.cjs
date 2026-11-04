// Publish Component 1 lesson decks to the course Drive folder as Google Slides (see "Publishing to Drive" in
// README.md; the work is done by ../drive_publish.cjs).
//
//   node publish_to_drive.cjs                  rebuild every lesson deck, then upload each deck (and its resources) that changed
//   node publish_to_drive.cjs L1.1_Media_Everywhere.pptx [--force]
//   node publish_to_drive.cjs --dry-run        rebuild and list what would be uploaded, without signing in
//
// Each deck goes to "Term 2 (Component 1 Theory)/1.1 Media Everywhere" as "Lesson 1.1 Media Everywhere".

// L1.1_Media_Everywhere → "1.1 Media Everywhere"
const lessonName = (key) => key.replace(/^L/, '').replace(/_/g, ' ');

require('../drive_publish.cjs')({ here: __dirname, folderName: lessonName, deckName: (key) => `Lesson ${lessonName(key)}` });
