package com.foodchain.web;

import com.foodchain.domain.DriverSchedule;
import com.foodchain.domain.User;
import com.foodchain.repo.DriverScheduleRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.security.CurrentUser;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers/me/schedule")
@PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
public class DriverScheduleController {

    private static final List<String> VALID_DAYS =
            List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");

    private final DriverScheduleRepository scheduleRepo;
    private final UserRepository userRepo;

    public DriverScheduleController(DriverScheduleRepository scheduleRepo, UserRepository userRepo) {
        this.scheduleRepo = scheduleRepo;
        this.userRepo = userRepo;
    }

    public record ScheduleEntry(
            @NotBlank @Pattern(regexp = "MON|TUE|WED|THU|FRI|SAT|SUN") String day,
            @NotNull String startTime,
            @NotNull String endTime
    ) {}

    public record ScheduleView(String day, String startTime, String endTime) {}

    @GetMapping
    public List<ScheduleView> get() {
        User driver = currentDriver();
        return scheduleRepo.findByDriver(driver).stream()
                .map(s -> new ScheduleView(s.getDayOfWeek(), s.getStartTime().toString(), s.getEndTime().toString()))
                .sorted((a, b) -> VALID_DAYS.indexOf(a.day()) - VALID_DAYS.indexOf(b.day()))
                .toList();
    }

    /** Replaces the entire schedule atomically. Send an empty list to clear all. */
    @PutMapping
    @Transactional
    public List<ScheduleView> put(@Valid @RequestBody List<ScheduleEntry> entries) {
        User driver = currentDriver();
        scheduleRepo.deleteByDriver(driver);

        for (ScheduleEntry e : entries) {
            LocalTime start, end;
            try {
                start = LocalTime.parse(e.startTime());
                end   = LocalTime.parse(e.endTime());
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("Invalid time format — use HH:mm (e.g. 09:00).");
            }
            if (!end.isAfter(start)) {
                throw new IllegalArgumentException("End time must be after start time for " + e.day() + ".");
            }

            DriverSchedule s = new DriverSchedule();
            s.setDriver(driver);
            s.setDayOfWeek(e.day().toUpperCase());
            s.setStartTime(start);
            s.setEndTime(end);
            scheduleRepo.save(s);
        }

        return get();
    }

    private User currentDriver() {
        return userRepo.findById(CurrentUser.get().userId()).orElseThrow();
    }
}
