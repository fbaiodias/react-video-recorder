// semantic-release: publishes from main, and prereleases (4.0.0-next.N, under
// npm's `next` tag) from next.
export default {
  branches: ['main', { name: 'next', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        writerOpts: {
          // Trailers like Co-Authored-By end up in the text of a preceding
          // BREAKING CHANGE note; keep them out of the release notes.
          finalizeContext: (context) => ({
            ...context,
            noteGroups: context.noteGroups.map((group) => ({
              ...group,
              notes: group.notes.map((note) => ({
                ...note,
                text: note.text.replace(/^[\w-]+-by: .*$/gim, '').trim()
              }))
            }))
          })
        }
      }
    ],
    '@semantic-release/npm',
    '@semantic-release/github'
  ]
}
