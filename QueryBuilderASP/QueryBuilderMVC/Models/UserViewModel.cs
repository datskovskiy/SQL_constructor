using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QueryBuilderMVC.Models
{
    public class UserViewModel
    {
        [ScaffoldColumn(false)]
        [Required(ErrorMessageResourceType = typeof(Resources.Resource),
                 ErrorMessageResourceName = "UserViewModelUser")]
        public string UserId { get; set; }

        public string UserName { get; set; }

        [ScaffoldColumn(false)]
        public int ProjectId { get; set; }

        public IEnumerable<UsersListViewModel> Users { get; set; }
    }
}