/* eslint-disable import/no-unused-modules */
import { ImageResponse } from '@vercel/og'

import { ProtocolVersion } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import getPool from 'utils/getPool'
import { WATERMARK_URL } from '../../../constants'
import getFont from '../../../utils/getFont'
import getNetworkLogoUrl from '../../../utils/getNetworkLogoURL'
import { getRequest } from '../../../utils/getRequest'

function PoolImage({
  token0Image,
  token1Image,
  children,
}: {
  token0Image?: string
  token1Image?: string
  children?: React.ReactNode
}) {
  const unknownTokenImage = (
    <div
      style={{
        fontFamily: 'Inter',
        fontSize: '32px',
        color: 'white',
        width: '84px',
        height: '168px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '168px 0 0 168px',
        borderRight: '4px solid #1B1B1B',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
      }}
    >
      UNK
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        width: '168px',
        height: '168px',
        position: 'relative',
      }}
    >
      {token0Image ? (
        <div
          style={{
            width: '84px',
            height: '168px',
            backgroundImage: `url(${token0Image})`,
            backgroundSize: '200% 100%',
            borderRadius: '168px 0 0 168px',
            borderRight: '4px solid #1B1B1B', // Border on the right edge of the first image
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)', // Clips to the left half
          }}
        />
      ) : (
        unknownTokenImage
      )}
      {token1Image ? (
        <div
          style={{
            width: '84px',
            height: '168px',
            backgroundImage: `url(${token1Image})`,
            backgroundPosition: '100% 0%',
            backgroundSize: '200% 100%',
            borderRadius: '0 168px 168px 0',
            borderLeft: '4px solid #1B1B1B', // Border on the left edge of the second image
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)', // Clips to the right half
          }}
        />
      ) : (
        unknownTokenImage
      )}
      {children}
    </div>
  )
}

export const onRequest: PagesFunction = async ({ params, request }) => {
  try {
    const origin = new URL(request.url).origin
    const { index } = params
    const networkName = String(index[0])
    const poolAddress = String(index[1])

    const cacheUrl = origin + '/pools/' + networkName + '/' + poolAddress
    const data = await getRequest(
      cacheUrl,
      () => getPool(networkName, poolAddress, cacheUrl),
      (data): data is NonNullable<Awaited<ReturnType<typeof getPool>>> => Boolean(data.title)
    )

    if (!data) {
      return new Response('Pool not found.', { status: 404 })
    }

    const [fontData] = await Promise.all([getFont(origin)])
    const networkLogo = getNetworkLogoUrl(networkName.toUpperCase(), origin)

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: '#1B1B1B',
            display: 'flex',
            width: '1200px',
            height: '630px',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: `#1B1B1B`,
              alignItems: 'center',
              height: '100%',
              padding: '96px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                height: '100%',
                color: 'white',
                gap: '54px',
              }}
            >
              <PoolImage token0Image={data.poolData?.token0Image} token1Image={data.poolData?.token1Image}>
                {networkLogo != '' && (
                  <img
                    src={networkLogo}
                    width="48px"
                    style={{
                      position: 'absolute',
                      right: '2px',
                      bottom: '0px',
                    }}
                  />
                )}
              </PoolImage>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '100px',
                      lineHeight: '120px',
                    }}
                  >
                    {data.name}
                  </div>
                  {data.poolData?.protocolVersion === ProtocolVersion.V2 && (
                    <div
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '48px',
                        lineHeight: '48px',
                        backgroundColor: '#FFFFFF12',
                        borderRadius: '24px',
                        padding: '12px 20px',
                        color: '#9B9B9B',
                        alignSelf: 'center',
                      }}
                    >
                      {data.poolData?.protocolVersion}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '72px',
                      lineHeight: '72px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      color: '#9B9B9B',
                    }}
                  >
                    {data.poolData?.feeTier}
                  </div>
                  <img src={WATERMARK_URL} alt="Uniswap" height="72px" width="324px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    ) as Response
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 })
  }
}
