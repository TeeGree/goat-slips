using GoatSlips.Attributes;
using GoatSlips.DAL;
using GoatSlips.Models.Database;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TimeSlipLogController : ControllerBase
    {
        private readonly ILogger<TimeSlipLogController> _logger;
        private readonly ITimeSlipLogRepository _timeSlipLogRepository;

        public TimeSlipLogController(
            ILogger<TimeSlipLogController> logger,
            ITimeSlipLogRepository timeSlipLogRepository
        )
        {
            _logger = logger;
            _timeSlipLogRepository = timeSlipLogRepository;
        }

        [HttpGet(Name = "GetTimeSlipLogs")]
        public ActionResult<IEnumerable<TimeSlipLog>> Get()
        {
            try
            {
                IEnumerable<TimeSlipLog> timeSlipLogs = _timeSlipLogRepository.TimeSlipLogs;
                return Ok(timeSlipLogs.OrderByDescending(tsl => tsl.TimeStamp));
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
