using GoatSlips.Attributes;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class FavoriteTimeSlipController : ControllerBase
    {
        private readonly ILogger<FavoriteTimeSlipController> _logger;
        private readonly IFavoriteTimeSlipService _favoriteTimeSlipService;

        public FavoriteTimeSlipController(
            ILogger<FavoriteTimeSlipController> logger,
            IFavoriteTimeSlipService favoriteTimeSlipService
        )
        {
            _logger = logger;
            _favoriteTimeSlipService = favoriteTimeSlipService;
        }

        [HttpPost("DeleteFavoriteTimeSlip/{id}", Name = "DeleteFavoriteTimeSlip")]
        public IActionResult DeleteFavoriteTimeSlip(int id)
        {
            try
            {
                _favoriteTimeSlipService.DeleteFavoriteTimeSlip(id);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("AddFavoriteTimeSlip", Name = "AddFavoriteTimeSlip")]
        public IActionResult AddFavoriteTimeSlip(AddFavoriteTimeSlipBody favoriteTimeSlip)
        {
            try
            {
                _favoriteTimeSlipService.AddFavoriteTimeSlip(
                    HttpContext,
                    favoriteTimeSlip.Name,
                    favoriteTimeSlip.ProjectId,
                    favoriteTimeSlip.TaskId,
                    favoriteTimeSlip.LaborCodeId
                );

                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("FavoriteTimeSlipsForCurrentUser", Name = "GetFavoriteTimeSlipsForCurrentUser")]
        public ActionResult<FavoriteTimeSlip[]> GetFavoriteTimeSlipsForCurrentUser()
        {
            try
            {
                FavoriteTimeSlip[] favoriteTimeSlips = _favoriteTimeSlipService.GetFavoriteTimeSlipsForCurrentUser(HttpContext).ToArray();
                return Ok(favoriteTimeSlips);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
