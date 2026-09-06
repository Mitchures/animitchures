import { gql } from '@apollo/client';

export const FEATURED_QUERY = gql`
  query Featured(
    $season: MediaSeason
    $seasonYear: Int
    $nextSeason: MediaSeason
    $nextYear: Int
    $isAdult: Boolean = false
  ) {
    trending: Page(page: 1, perPage: 15) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: $isAdult) {
        ...media
      }
    }
    season: Page(page: 1, perPage: 15) {
      media(
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        type: ANIME
        isAdult: $isAdult
      ) {
        ...media
      }
    }
    nextSeason: Page(page: 1, perPage: 15) {
      media(
        season: $nextSeason
        seasonYear: $nextYear
        sort: POPULARITY_DESC
        type: ANIME
        isAdult: $isAdult
      ) {
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

export const SEARCH_QUERY = gql`
  query Search(
    $page: Int
    $perPage: Int
    $id: Int
    $type: MediaType
    $isAdult: Boolean = false
    $search: String
    $format: [MediaFormat]
    $status: MediaStatus
    $countryOfOrigin: CountryCode
    $source: MediaSource
    $season: MediaSeason
    $seasonYear: Int
    $year: String
    $onList: Boolean
    $yearLesser: FuzzyDateInt
    $yearGreater: FuzzyDateInt
    $episodeLesser: Int
    $episodeGreater: Int
    $durationLesser: Int
    $durationGreater: Int
    $chapterLesser: Int
    $chapterGreater: Int
    $volumeLesser: Int
    $volumeGreater: Int
    $licensedBy: [String]
    $genres: [String]
    $excludedGenres: [String]
    $tags: [String]
    $excludedTags: [String]
    $minimumTagRank: Int
    $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        id: $id
        type: $type
        season: $season
        format_in: $format
        status: $status
        countryOfOrigin: $countryOfOrigin
        source: $source
        search: $search
        onList: $onList
        seasonYear: $seasonYear
        startDate_like: $year
        startDate_lesser: $yearLesser
        startDate_greater: $yearGreater
        episodes_lesser: $episodeLesser
        episodes_greater: $episodeGreater
        duration_lesser: $durationLesser
        duration_greater: $durationGreater
        chapters_lesser: $chapterLesser
        chapters_greater: $chapterGreater
        volumes_lesser: $volumeLesser
        volumes_greater: $volumeGreater
        licensedBy_in: $licensedBy
        genre_in: $genres
        genre_not_in: $excludedGenres
        tag_in: $tags
        tag_not_in: $excludedTags
        minimumTagRank: $minimumTagRank
        sort: $sort
        isAdult: $isAdult
      ) {
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
`;

export const DETAILS_LIST_QUERY = gql`
  query DetailsList($id_in: [Int], $type: MediaType, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(id_in: $id_in, type: $type) {
        id
        isAdult
        title {
          userPreferred
          english
          romaji
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
      }
    }
  }
`;

export const DETAILS_QUERY = gql`
  query Details($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      isAdult
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

export const DETAILS_EXTENDED_QUERY = gql`
  query DetailsExtended($id: Int, $type: MediaType, $isAdult: Boolean) {
    Media(id: $id, type: $type, isAdult: $isAdult) {
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
      bannerImage
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
      description
      season
      seasonYear
      type
      format
      status(version: 2)
      episodes
      duration
      chapters
      volumes
      genres
      synonyms
      source(version: 3)
      isAdult
      isLocked
      meanScore
      averageScore
      popularity
      favourites
      hashtag
      countryOfOrigin
      isLicensed
      isFavourite
      isRecommendationBlocked
      isFavouriteBlocked
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            title {
              english
              userPreferred
            }
            format
            type
            status(version: 2)
            bannerImage
            coverImage {
              large
            }
          }
        }
      }
      characters(perPage: 24, sort: [ROLE, RELEVANCE, ID]) {
        edges {
          id
          role
          name
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              userPreferred
            }
            language: languageV2
            image {
              large
            }
          }
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
      staff(perPage: 16, sort: [RELEVANCE, ID]) {
        edges {
          id
          role
          node {
            id
            name {
              userPreferred
            }
            language: languageV2
            image {
              large
            }
          }
        }
      }
      studios {
        edges {
          isMain
          node {
            id
            name
          }
        }
      }
      reviews(perPage: 2, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
        }
        nodes {
          id
          summary
          rating
          ratingAmount
          user {
            id
            name
            avatar {
              large
            }
          }
        }
      }
      recommendations(perPage: 7, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
        }
        nodes {
          id
          rating
          userRating
          mediaRecommendation {
            id
            title {
              userPreferred
            }
            format
            type
            status(version: 2)
            bannerImage
            coverImage {
              large
            }
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
      }
      externalLinks {
        site
        url
      }
      streamingEpisodes {
        site
        title
        thumbnail
        url
      }
      trailer {
        id
        site
      }
      rankings {
        id
        rank
        type
        format
        year
        season
        allTime
        context
      }
      tags {
        id
        name
        description
        rank
        isMediaSpoiler
        isGeneralSpoiler
        userId
      }
      mediaListEntry {
        id
        status
        progress
        score
      }
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
      }
    }
  }
`;

// Unique to AniList queries.

export const ANILIST_USER_AND_ACTIVITY_QUERY = gql`
  query AnilistUserAndActivity($id: Int, $name: String, $type: ActivityType, $page: Int = 1) {
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
`;

export const ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY = gql`
  query AnilistMediaListCollection($userId: Int, $userName: String, $type: MediaType) {
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
      nextAiringEpisode {
        episode
        airingAt
      }
      startDate {
        year
        month
        day
      }
    }
  }
`;
// Viewer query requires anilist authentication.
export const ANILIST_VIEWER_QUERY = gql`
  query AnilistViewer {
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
`;

export const ANILIST_USER_NOTIFICATIONS_QUERY = gql`
  query AnilistUserNotifications($page: Int, $types: [NotificationType]) {
    Page(page: $page, perPage: 15) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      notifications(type_in: $types, resetNotificationCount: true) {
        ... on AiringNotification {
          id
          type
          episode
          contexts
          media {
            id
            type
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
          createdAt
        }
        ... on RelatedMediaAdditionNotification {
          id
          type
          context
          media {
            id
            type
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
          createdAt
        }
        ... on FollowingNotification {
          id
          type
          context
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityMessageNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityMentionNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityReplyNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityReplySubscribedNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityLikeNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ActivityReplyLikeNotification {
          id
          type
          context
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ThreadCommentMentionNotification {
          id
          type
          context
          commentId
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ThreadCommentReplyNotification {
          id
          type
          context
          commentId
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ThreadCommentSubscribedNotification {
          id
          type
          context
          commentId
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ThreadCommentLikeNotification {
          id
          type
          context
          commentId
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on ThreadLikeNotification {
          id
          type
          context
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
          createdAt
        }
        ... on MediaDataChangeNotification {
          id
          type
          context
          media {
            id
            type
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
          reason
          createdAt
        }
        ... on MediaMergeNotification {
          id
          type
          context
          media {
            id
            type
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
          deletedMediaTitles
          reason
          createdAt
        }
        ... on MediaDeletionNotification {
          id
          type
          context
          deletedMediaTitle
          reason
          createdAt
        }
      }
    }
  }
`;

/**
 * A staff member and the characters they have played.
 *
 * `characters` is sorted by how beloved each character is rather than by
 * recency: someone arriving from a cast chip is looking for the role they
 * already know, which is almost never the most recent one.
 */
export const STAFF_QUERY = gql`
  query StaffPage($id: Int!, $page: Int) {
    Staff(id: $id) {
      id
      name {
        full
        native
      }
      image {
        large
      }
      description(asHtml: false)
      primaryOccupations
      gender
      homeTown
      yearsActive
      favourites
      dateOfBirth {
        year
        month
        day
      }
      characters(sort: FAVOURITES_DESC, page: $page, perPage: 24) {
        pageInfo {
          hasNextPage
          currentPage
        }
        edges {
          id
          node {
            id
            name {
              full
            }
            image {
              large
            }
            favourites
          }
          media {
            id
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

/** A character, and every title they appear in with who voiced them. */
export const CHARACTER_QUERY = gql`
  query CharacterPage($id: Int!, $page: Int) {
    Character(id: $id) {
      id
      name {
        full
        native
      }
      image {
        large
      }
      description(asHtml: false)
      gender
      age
      favourites
      dateOfBirth {
        year
        month
        day
      }
      media(sort: POPULARITY_DESC, page: $page, perPage: 24) {
        pageInfo {
          hasNextPage
          currentPage
        }
        edges {
          id
          characterRole
          node {
            id
            title {
              userPreferred
            }
            coverImage {
              large
            }
            seasonYear
            averageScore
            episodes
          }
          voiceActors(language: JAPANESE) {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
    }
  }
`;

/**
 * A studio's filmography, in date order.
 *
 * `isMain: true` keeps this to productions the studio actually animated —
 * without it the list fills with titles they only had a hand in. Sorted by
 * date because a studio's story is chronological; popularity order would
 * cherry-pick each year's best and hide the shape of their run.
 */
export const STUDIO_QUERY = gql`
  query StudioPage($id: Int!, $page: Int) {
    Studio(id: $id) {
      id
      name
      favourites
      isAnimationStudio
      media(sort: START_DATE_DESC, isMain: true, page: $page, perPage: 36) {
        pageInfo {
          hasNextPage
          currentPage
        }
        nodes {
          id
          title {
            userPreferred
          }
          coverImage {
            large
          }
          seasonYear
          season
          format
          episodes
          averageScore
        }
      }
    }
  }
`;

/**
 * The statistics the profile query fetches and throws away.
 *
 * Kept separate from ANILIST_USER_AND_ACTIVITY_QUERY rather than folded into
 * it: this is a much heavier selection, and the profile page renders none of
 * it. One page paying for another page's data is how the profile query got
 * fat in the first place.
 *
 * `scores` is the one that carries the page — it is the full distribution, so
 * the rating curve is drawn from real buckets rather than being inferred from
 * a mean and a standard deviation.
 */
export const TASTE_QUERY = gql`
  query TastePage($id: Int, $name: String) {
    User(id: $id, name: $name) {
      id
      name
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
          scores(sort: MEAN_SCORE) {
            score
            count
          }
          studios(sort: COUNT_DESC, limit: 6) {
            count
            meanScore
            studio {
              id
              name
            }
          }
          voiceActors(sort: COUNT_DESC, limit: 6) {
            count
            voiceActor {
              id
              name {
                full
              }
              image {
                large
              }
            }
          }
          tags(sort: COUNT_DESC, limit: 10) {
            count
            tag {
              id
              name
            }
          }
          # UserStatisticsSort has no RELEASE_YEAR member — only COUNT, ID,
          # MEAN_SCORE, PROGRESS and their DESC forms. ID orders by year here,
          # and YearHistogram sorts again anyway.
          releaseYears(sort: ID) {
            releaseYear
            count
          }
          formats(sort: COUNT_DESC) {
            format
            count
          }
          countries(sort: COUNT_DESC) {
            country
            count
          }
          lengths(sort: COUNT_DESC) {
            length
            count
          }
        }
      }
    }
  }
`;
