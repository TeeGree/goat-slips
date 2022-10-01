using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TimeSlipController : ControllerBase
    {

        private readonly ILogger<TimeSlipController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public TimeSlipController(ILogger<TimeSlipController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetTimeSlips")]
        public ActionResult<IEnumerable<TimeSlip>> Get()
        {
            DbSet<TimeSlip>? timeSlips = _goatSlipsContext.TimeSlips;
            if (timeSlips == null)
            {
                var message = "No time slips found!";
                _logger.LogError(message);
                return Problem(message);
            }
            return timeSlips;
        }

        [HttpPost("AddTimeSlip", Name = "AddTimeSlip")]
        public IActionResult AddTimeSlip(AddTimeSlipBody timeSlip)
        {
            User? user = HttpContext.Items["User"] as User;
            if (user == null)
            {
                var message = "No user logged in!";
                _logger.LogError(message);
                return Problem(message);
            }

            var timeSlipToAdd = new TimeSlip
            {
                Hours = timeSlip.Hours,
                Minutes = timeSlip.Minutes,
                Date = timeSlip.Date,
                ProjectId = timeSlip.ProjectId,
                TaskId = timeSlip.TaskId,
                LaborCodeId = timeSlip.LaborCodeId,
                UserId = user.Id
            };
            _goatSlipsContext.TimeSlips?.Add(timeSlipToAdd);
            _goatSlipsContext.SaveChanges();
            return Ok();
        }
    }
}