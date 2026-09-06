import { gql } from '@apollo/client';

export const SAVE_MEDIA_LIST_ENTRY_SIMPLE_MUTATION = gql`
  mutation SaveMediaListEntrySimple($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      id
      status
    }
  }
`;

export const SAVE_MEDIA_LIST_ENTRY_MUTATION = gql`
  mutation SaveMediaListEntryFull(
    $id: Int
    $mediaId: Int
    $status: MediaListStatus
    $score: Float
    $progress: Int
    $progressVolumes: Int
    $repeat: Int
    $private: Boolean
    $notes: String
    $customLists: [String]
    $hiddenFromStatusLists: Boolean
    $advancedScores: [Float]
    $startedAt: FuzzyDateInput
    $completedAt: FuzzyDateInput
  ) {
    SaveMediaListEntry(
      id: $id
      mediaId: $mediaId
      status: $status
      score: $score
      progress: $progress
      progressVolumes: $progressVolumes
      repeat: $repeat
      private: $private
      notes: $notes
      customLists: $customLists
      hiddenFromStatusLists: $hiddenFromStatusLists
      advancedScores: $advancedScores
      startedAt: $startedAt
      completedAt: $completedAt
    ) {
      id
      mediaId
      status
      score
      advancedScores
      progress
      progressVolumes
      repeat
      priority
      private
      hiddenFromStatusLists
      customLists
      notes
      updatedAt
      startedAt {
        year
        month
        day
      }
      completedAt {
        year
        month
        day
      }
      user {
        id
        name
      }
      media {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
        type
        format
        status
        episodes
        volumes
        chapters
        averageScore
        popularity
        isAdult
        startDate {
          year
        }
      }
    }
  }
`;

/**
 * Account settings that live on AniList rather than in this app.
 *
 * Every field is optional, and AniList leaves anything omitted untouched — so
 * a single changed control sends only itself rather than rewriting the whole
 * account. `about` is deliberately absent: a bio belongs to a profile editor,
 * not a settings list.
 */
export const UPDATE_ANILIST_USER_MUTATION = gql`
  mutation UpdateAnilistUser(
    $scoreFormat: ScoreFormat
    $rowOrder: String
    $displayAdultContent: Boolean
    $airingNotifications: Boolean
    $activityMergeTime: Int
    $timezone: String
    $profileColor: String
    $titleLanguage: UserTitleLanguage
    $staffNameLanguage: UserStaffNameLanguage
    $animeListOptions: MediaListOptionsInput
  ) {
    UpdateUser(
      scoreFormat: $scoreFormat
      rowOrder: $rowOrder
      displayAdultContent: $displayAdultContent
      airingNotifications: $airingNotifications
      activityMergeTime: $activityMergeTime
      timezone: $timezone
      profileColor: $profileColor
      titleLanguage: $titleLanguage
      staffNameLanguage: $staffNameLanguage
      animeListOptions: $animeListOptions
    ) {
      id
      options {
        titleLanguage
        staffNameLanguage
        displayAdultContent
        airingNotifications
        activityMergeTime
        timezone
        profileColor
      }
      mediaListOptions {
        scoreFormat
        rowOrder
        animeList {
          splitCompletedSectionByFormat
        }
      }
    }
  }
`;
