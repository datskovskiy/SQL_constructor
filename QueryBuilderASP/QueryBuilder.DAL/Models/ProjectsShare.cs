#pragma warning disable 0436

namespace QueryBuilder.DAL.Models
{
    public class ProjectsShare
    {
        public int ProjectId { get; set; }

        public string UserId { get; set; }

        public string FromUserId { get; set; }

        public int UserRole { get; set; }

        public virtual Project Project { get; set; }

        public virtual ApplicationUser User { get; set; }
    }
}
