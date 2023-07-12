---
# https://github.com/11ty/eleventy/issues/510#issuecomment-824104799
pagination:
  data: redirects
  size: 1
  alias: redirect
redirects:
  - {"from": "/100days/", "to": "/journal/2017-06-24-100-days/" }
  - {"from": "/games/100days/", "to": "/journal/2017-06-24-100-days/" }
  - {"from": "/100days/kaleclicker/", "to": "/games/kale-clicker/play/" }
  - {"from": "/100days/noteworthyadventures/", "to": "/games/noteworthy-adventures/play/" }
  - {"from": "/100days/service/", "to": "/games/service/play/" }
  - {"from": "/100days/glitchrace/", "to": "/games/glitchrace/play/" }
  - {"from": "/100days/winter/", "to": "/games/winter/play/" }
  - {"from": "/100days/90milebeach/", "to": "/games/90-mile-beach/play/" }
  - {"from": "/100days/lorb/", "to": "/games/lorb/play/" }
  - {"from": "/100days/rockstormers/", "to": "/games/rockstormers-1/play/" }
  - {"from": "/100days/vampiretanks/", "to": "/games/vampire-tanks/play/" }
  - {"from": "/100days/hrvst/", "to": "/games/hrvst/play/" }
  - {"from": "/100days/snakeshed/", "to": "/games/snakeshed/play/" }
  - {"from": "/100days/shotdown/", "to": "/games/shotdown/play/" }
  - {"from": "/100days/luckywin/", "to": "/games/lucky-win/play/" }
  - {"from": "/100days/saidso/", "to": "/games/said-so/play/" }
  - {"from": "/100days/follower/", "to": "/games/follower/play/" }
  - {"from": "/100days/avoiding/", "to": "/games/avoiding/play/" }
  - {"from": "/100days/hatmin/", "to": "/games/hatmin/play/" }
  - {"from": "/100days/trader/", "to": "/games/trader/play/" }
  - {"from": "/100days/gunson/", "to": "/games/gunson/play/" }
  - {"from": "/100days/bugs/", "to": "/games/bugs-1day/play/" }
  - {"from": "/100days/playfair/", "to": "/games/playfair/play/" }
  - {"from": "/100days/scribble/", "to": "/games/scribble/" }

permalink: "{{ redirect.from }}"
layout: redirect
---
(this content is unused)