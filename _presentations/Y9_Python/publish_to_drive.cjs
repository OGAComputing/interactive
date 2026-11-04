// Publish Y9 Python lesson decks to the "Y9 Python Unit 1" Drive folder as Google Slides (see "Publishing to Drive"
// in README.md; the work is done by ../drive_publish.cjs).
//
//   node publish_to_drive.cjs                  rebuild every lesson deck, then upload each deck that changed
//   node publish_to_drive.cjs L3_While_Loops.pptx [--force]
//   node publish_to_drive.cjs --dry-run        rebuild and list what would be uploaded, without signing in
//
// Each deck goes to a folder named after it, e.g. L3_While_Loops/L3_While_Loops, and its Slides ID is written to
// ../lesson-slides.json under Y9/Python/<deck name>, so the hub attaches it to the lesson's Classroom post.

require('../drive_publish.cjs')({ here: __dirname, folderName: (key) => key, deckName: (key) => key, lessonSlides: 'Y9/Python' });
