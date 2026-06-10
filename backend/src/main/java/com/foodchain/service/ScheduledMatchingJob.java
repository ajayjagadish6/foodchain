package com.foodchain.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodically retries matching for any open donations / requests that were not
 * matched at submission time (e.g. because no counterpart existed yet).
 *
 * Design-criteria requirement: "If there isn't an exact match [at submission],
 * it is updated every 5 minutes."
 */
@Component
public class ScheduledMatchingJob {

    private static final Logger log = LoggerFactory.getLogger(ScheduledMatchingJob.class);

    private final MatchingService matchingService;

    public ScheduledMatchingJob(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /**
     * Retry all unmatched pairs every 5 minutes (configurable via MATCH_RETRY_CRON).
     * Runs in a loop until no new match is found, so a single batch of open items
     * can all be matched in one scheduled tick.
     */
    @Scheduled(cron = "${foodchain.matching.retryCron:0 */5 * * * *}")
    public void retryMatching() {
        int matched = 0;
        while (matchingService.tryMatchNow().isPresent()) {
            matched++;
        }
        if (matched > 0) {
            log.info("Scheduled matching job produced {} new match(es)", matched);
        }
    }
}
