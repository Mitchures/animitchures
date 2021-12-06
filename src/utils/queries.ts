export const FEATURED_QUERY = `
  query ($season: MediaSeason, $seasonYear: Int, $nextSeason: MediaSeason, $nextYear: Int, $isAdult: Boolean = false) {
    trending: Page(page: 1, perPage: 15) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
    season: Page(page: 1, perPage: 15) {
      media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
    nextSeason: Page(page: 1, perPage: 15) {
      media(season: $nextSeason, seasonYear: $nextYear, sort: POPULARITY_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
    popular: Page(page: 1, perPage: 15) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
    top: Page(page: 1, perPage: 15) {
      media(sort: SCORE_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
  }

  fragment media on Media {
    id
    title {
      english
      userPreferred
    }
    coverImage {
      extraLarge
      large
      color
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    bannerImage
    season
    description
    type
    format
    status(version: 2)
    episodes
    duration
    chapters
    volumes
    genres
    isAdult
    averageScore
    popularity
    mediaListEntry {
      id
      status
    }
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
    }
    studios(isMain: true) {
      edges {
        isMain
        node {
          id
          name
        }
      }
    }
  }
`;

export const SEARCH_QUERY = `
  query ($page: Int = 1, $id: Int, $type: MediaType, $isAdult: Boolean = false, $search: String, $format: [MediaFormat], $status: MediaStatus, $countryOfOrigin: CountryCode, $source: MediaSource, $season: MediaSeason, $seasonYear: Int, $year: String, $onList: Boolean, $yearLesser: FuzzyDateInt, $yearGreater: FuzzyDateInt, $episodeLesser: Int, $episodeGreater: Int, $durationLesser: Int, $durationGreater: Int, $chapterLesser: Int, $chapterGreater: Int, $volumeLesser: Int, $volumeGreater: Int, $licensedBy: [String], $genres: [String], $excludedGenres: [String], $tags: [String], $excludedTags: [String], $minimumTagRank: Int, $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(id: $id, type: $type, season: $season, format_in: $format, status: $status, countryOfOrigin: $countryOfOrigin, source: $source, search: $search, onList: $onList, seasonYear: $seasonYear, startDate_like: $year, startDate_lesser: $yearLesser, startDate_greater: $yearGreater, episodes_lesser: $episodeLesser, episodes_greater: $episodeGreater, duration_lesser: $durationLesser, duration_greater: $durationGreater, chapters_lesser: $chapterLesser, chapters_greater: $chapterGreater, volumes_lesser: $volumeLesser, volumes_greater: $volumeGreater, licensedBy_in: $licensedBy, genre_in: $genres, genre_not_in: $excludedGenres, tag_in: $tags, tag_not_in: $excludedTags, minimumTagRank: $minimumTagRank, sort: $sort, isAdult: $isAdult) {
        id
        title {
          userPreferred
        }
        coverImage {
          extraLarge
          large
          color
        }
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        bannerImage
        season
        description
        type
        format
        status(version: 2)
        episodes
        duration
        chapters
        volumes
        genres
        isAdult
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        mediaListEntry {
          id
          status
        }
        studios(isMain: true) {
          edges {
            isMain
            node {
              id
              name
            }
          }
        }
      }
    }
  }
`

export const DETAILS_QUERY = `
  query media($id: Int, $type: MediaType, $isAdult: Boolean) {
    Media(id: $id, type: $type, isAdult: $isAdult) {
      id
      title {
        userPreferred
        english
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
    }
  }
`;

// Unique to AniList queries.

export const ANILIST_USER_ACTIVITY_QUERY = `
  query ($id: Int, $type: ActivityType, $page: Int = 1) {
    Page(page: $page, perPage: 25) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      activities(userId: $id, type: $type, sort: ID_DESC) {
        ... on ListActivity {
          id
          type
          replyCount
          status
          progress
          isLocked
          isSubscribed
          isLiked
          likeCount
          createdAt
          user {
            id
            name
            avatar {
              large
            }
          }
          media {
            id
            type
            status(version: 2)
            isAdult
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
        }
        ... on TextActivity {
          id
          type
          text
          replyCount
          isLocked
          isSubscribed
          isLiked
          likeCount
          createdAt
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on MessageActivity {
          id
          type
          message
          replyCount
          isPrivate
          isLocked
          isSubscribed
          isLiked
          likeCount
          createdAt
          user: recipient {
            id
          }
          messenger {
            id
            name
            donatorTier
            donatorBadge
            moderatorRoles
            avatar {
              large
            }
          }
        }
      }
    }
  }
`

export const ANILIST_USER_DETAILS_QUERY = `
  query ($id: Int, $name: String) {
    User(id: $id, name: $name) {
      id
      name
      previousNames {
        name
        updatedAt
      }
      avatar {
        large
      }
      bannerImage
      about
      isFollowing
      isFollower
      donatorTier
      donatorBadge
      createdAt
      moderatorRoles
      isBlocked
      bans
      options {
        profileColor
      }
      mediaListOptions {
        scoreFormat
      }
      statistics {
        anime {
          count
          meanScore
          standardDeviation
          minutesWatched
          episodesWatched
          genrePreview: genres(limit: 10, sort: COUNT_DESC) {
            genre
            count
          }
        }
        manga {
          count
          meanScore
          standardDeviation
          chaptersRead
          volumesRead
          genrePreview: genres(limit: 10, sort: COUNT_DESC) {
            genre
            count
          }
        }
      }
      stats {
        activityHistory {
          date
          amount
          level
        }
      }
      favourites {
        anime {
          edges {
            favouriteOrder
            node {
              id
              type
              status(version: 2)
              format
              isAdult
              bannerImage
              title {
                userPreferred
              }
              coverImage {
                large
              }
              startDate {
                year
              }
            }
          }
        }
        manga {
          edges {
            favouriteOrder
            node {
              id
              type
              status(version: 2)
              format
              isAdult
              bannerImage
              title {
                userPreferred
              }
              coverImage {
                large
              }
              startDate {
                year
              }
            }
          }
        }
        characters {
          edges {
            favouriteOrder
            node {
              id
              name {
                userPreferred
              }
              image {
                large
              }
            }
          }
        }
        staff {
          edges {
            favouriteOrder
            node {
              id
              name {
                userPreferred
              }
              image {
                large
              }
            }
          }
        }
        studios {
          edges {
            favouriteOrder
            node {
              id
              name
            }
          }
        }
      }
    }
  }
`
export const ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY = `
  query ($userId: Int, $userName: String, $type: MediaType) {
    MediaListCollection(userId: $userId, userName: $userName, type: $type) {
      lists {
        name
        isCustomList
        isCompletedList: isSplitCompletedList
        entries {
          ...mediaListEntry
        }
      }
      user {
        id
        name
        avatar {
          large
        }
        mediaListOptions {
          scoreFormat
          rowOrder
          animeList {
            sectionOrder
            customLists
            splitCompletedSectionByFormat
            theme
          }
          mangaList {
            sectionOrder
            customLists
            splitCompletedSectionByFormat
            theme
          }
        }
      }
    }
  }

  fragment mediaListEntry on MediaList {
    id
    mediaId
    status
    score
    progress
    progressVolumes
    repeat
    priority
    private
    hiddenFromStatusLists
    customLists
    advancedScores
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
    media {
      id
      title {
        userPreferred
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      type
      format
      status(version: 2)
      episodes
      volumes
      chapters
      averageScore
      popularity
      isAdult
      countryOfOrigin
      genres
      bannerImage
      startDate {
        year
        month
        day
      }
    }
  }
`
// Viewer query requires anilist authentication.
export const ANILIST_VIEWER_QUERY = `
  query {
    Viewer {
      id
      name
      about
      avatar {
        large
      }
      bannerImage
      unreadNotificationCount
      donatorTier
      donatorBadge
      moderatorRoles
      options {
        titleLanguage
        staffNameLanguage
        airingNotifications
        displayAdultContent
        profileColor
        notificationOptions {
          type
          enabled
        }
      }
      mediaListOptions {
        scoreFormat
        rowOrder
        animeList {
          customLists
          sectionOrder
          splitCompletedSectionByFormat
          advancedScoring
          advancedScoringEnabled
        }
        mangaList {
          customLists
          sectionOrder
          splitCompletedSectionByFormat
          advancedScoring
          advancedScoringEnabled
        }
      }
    }
  }
`

