function QualsResults({ qualsLeaderboard }) {
  console.log("qualsLeaderboard qualsLeaderboard", qualsLeaderboard);

  return (
    <>
      <div className="quals-results">
        <div className="quals-results__container">
          <div className="quals-results__top-container">
            <div className="quals-results__tittles">
              <div className="quals-results__tittle-name">Имя</div>
              <div className="quals-results__tittle-time">Время</div>
              <div className="quals-results__tittle-lead">Отставание</div>
            </div>
            <div className="quals-results__top-pilots">
              <div className="quals-results__top-pilot">
                <div className="quals-results__top-pilot-name">
                  <p>1</p>
                  <p>Кошка 1</p>
                </div>
                <div className="quals-results__top-pilot-time">0:22.192</div>
                <div className="quals-results__top-pilot-gap">-:--.---</div>
              </div>
              <div className="quals-results__top-pilot">
                <div className="quals-results__top-pilot-name">
                  <p>2</p>
                  <p>Кошка 2</p>
                </div>
                <div className="quals-results__top-pilot-time">0:22.192</div>
                <div className="quals-results__top-pilot-gap">+0:01.120</div>
              </div>
              <div className="quals-results__top-pilot">
                <div className="quals-results__top-pilot-name">
                  <p>3</p>
                  <p>Станкевич Алексей</p>
                </div>
                <div className="quals-results__top-pilot-time">0:22.192</div>
                <div className="quals-results__top-pilot-gap">+0:01.120</div>
              </div>
              <div className="quals-results__top-pilot">
                <div className="quals-results__top-pilot-name">
                  <p>..</p>
                  <p>Меньшиков Владислав</p>
                </div>
                <div className="quals-results__top-pilot-time"><p>2/</p>0:22.192</div>
                <div className="quals-results__top-pilot-gap">+1 круг</div>
              </div>
              <div className="quals-results__top-pilot">
                <div className="quals-results__top-pilot-name">
                  <p>16</p>
                  <p>Кошка 5</p>
                </div>
                <div className="quals-results__top-pilot-time"><p>3/</p>0:22.192</div>
                <div className="quals-results__top-pilot-gap">+0:01.120</div>
              </div>
            </div>
          </div>
          <div className="quals-results__bot-container">
            <div className="quals-results__bot-pilots">
              <div className="quals-results__bot-pilot">
                <div className="quals-results__bot-pilot-name">
                  <p>17</p>
                  <p>CAT 7</p>
                </div>
                <div className="quals-results__bot-pilot-time">0:22.192</div>
                <div className="quals-results__bot-pilot-gap">+0:01.120</div>
              </div>
              <div className="quals-results__bot-pilot">
                <div className="quals-results__bot-pilot-name">
                  <p>18</p>
                  <p>CAT 7</p>
                </div>
                <div className="quals-results__bot-pilot-time">0:22.192</div>
                <div className="quals-results__bot-pilot-gap">+0:01.120</div>
              </div>
              <div className="quals-results__bot-pilot">
                <div className="quals-results__bot-pilot-name">
                  <p>..</p>
                  <p>CAT ?</p>
                </div>
                <div className="quals-results__bot-pilot-time"><p>3/</p>0:22.192</div>
                <div className="quals-results__bot-pilot-gap">+0:01.120</div>
              </div>
              <div className="quals-results__bot-pilot">
                <div className="quals-results__bot-pilot-name">
                  <p>47</p>
                  <p>Andre Adams</p>
                </div>
                <div className="quals-results__bot-pilot-time"><p>3/</p>0:22.192</div>
                <div className="quals-results__bot-pilot-gap">+0:01.120</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default QualsResults;
