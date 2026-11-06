// Publish Y8 Data Representation lesson decks to the "Data Representation" Drive folder as Google Slides (see
// "Publishing to Drive" in README.md; the work is done by ../drive_publish.cjs).
//
//   node publish_to_drive.cjs                         rebuild every lesson deck, then upload each deck that changed
//   node publish_to_drive.cjs L1_Binary_And_Denary.pptx [--force]
//   node publish_to_drive.cjs --dry-run               rebuild and list what would be uploaded, without signing in
//
// Each deck goes to a folder named after it, e.g. L1_Binary_And_Denary/L1_Binary_And_Denary, and its Slides ID is
// written to ../lesson-slides.json under Y8/Data_Representation/<deck name>, so the hub attaches it to the lesson's
// Classroom post.

require('../drive_publish.cjs')({ here: __dirname, folderName: (key) => key, deckName: (key) => key, lessonSlides: 'Y8/Data_Representation' });
