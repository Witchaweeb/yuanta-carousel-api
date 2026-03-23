module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  try {
    const response = await fetch(
      'https://apps.yuanta.co.th/ytcmsapi/XML/RSS?contentType=research&category=wealth-designs-daily'
    )
    const xml = await response.text()

    const getTag = (item, tag) => {
      const m = item.match(
        new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
      )
      return m ? (m[1] || m[2] || '').trim() : ''
    }

    const getAttr = (item, tag, attr) => {
      const m = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`))
      return m ? m[1] : ''
    }

    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    const bubbles = itemMatches.slice(0, 5).map(item => ({
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: getTag(item, 'title').substring(0, 60) || '-',
            weight: 'bold',
            size: 'sm',
            wrap: true,
            maxLines: 2
          },
          {
            type: 'text',
            text: getTag(item, 'description').replace(/<[^>]+>/g, '').substring(0, 80) || '',
            size: 'xs',
            color: '#888888',
            wrap: true,
            maxLines: 3,
            margin: 'sm'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [{
          type: 'button',
          action: {
            type: 'uri',
            label: 'อ่านเพิ่มเติม',
            uri: getTag(item, 'link') || 'https://yuanta.co.th'
          },
          style: 'primary',
          color: '#005BAC',
          height: 'sm'
        }]
      }
    }))

    res.json({
      type: 'flex',
      altText: 'Wealth Designs Daily',
      contents: {
        type: 'carousel',
        contents: bubbles
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
