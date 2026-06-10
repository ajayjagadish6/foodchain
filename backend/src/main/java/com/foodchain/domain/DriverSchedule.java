package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "driver_schedules",
       uniqueConstraints = @UniqueConstraint(columnNames = {"driver_id", "day_of_week"}))
public class DriverSchedule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "driver_id")
    private User driver;

    /** Three-letter day code: MON TUE WED THU FRI SAT SUN */
    @Column(name = "day_of_week", nullable = false, length = 3)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    public Long getId() { return id; }
    public User getDriver() { return driver; }
    public String getDayOfWeek() { return dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }

    public void setId(Long id) { this.id = id; }
    public void setDriver(User driver) { this.driver = driver; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
