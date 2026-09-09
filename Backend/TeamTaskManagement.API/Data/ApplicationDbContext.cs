using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    public DbSet<Comment> Comments => Set<Comment>();

    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Team
        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(t => t.CreatedBy)
                .WithMany(u => u.CreatedTeams)
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TeamMember
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(tm => tm.Id);

            entity.HasIndex(tm => new
            {
                tm.TeamId,
                tm.UserId
            })
            .IsUnique();

            entity.HasOne(tm => tm.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tm => tm.User)
                .WithMany(u => u.TeamMemberships)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Task
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.Priority)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(t => t.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(t => t.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(t => t.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(t => t.AssignedToId);

            entity.HasIndex(t => t.Status);

            entity.HasIndex(t => t.Priority);

            entity.HasIndex(t => t.DueDate);

            entity.HasOne(t => t.CreatedBy)
                .WithMany(u => u.CreatedTasks)
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.AssignedTo)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Team)
                .WithMany(team => team.Tasks)
                .HasForeignKey(t => t.TeamId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Comment
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(c => c.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);

            entity.Property(n => n.Type)
                .HasConversion<string>()
                .HasMaxLength(30);

            entity.Property(n => n.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(n => n.Task)
                .WithMany(t => t.Notifications)
                .HasForeignKey(n => n.TaskId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}