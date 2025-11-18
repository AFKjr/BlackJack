function renderCard(card)
{
  // Designing the card without using sprites or images.
  const cardDesign = document.createElement('div');
  cardDesign.className = 'card';
  cardDesign.dataset.rank = card.rank;
  cardDesign.dataset.suit = card.suit;
  cardDesign.title = `${card.rank} of ${card.suit}`;

  // top-left corner
  const top = document.createElement('div');
  top.className = 'corner top';
  top.textContent = card.rank + '\n' + card.symbol;

  // center suit large
  const center = document.createElement('div');
  center.className = 'center-suit';
  center.textContent = card.symbol;

  // bottom-right corner (rotated)
  const bottom = document.createElement('div');
  bottom.className = 'corner bottom';
  bottom.textContent = card.rank + '\n' + card.symbol;

  cardDesign.appendChild(top);
  cardDesign.appendChild(center);
  cardDesign.appendChild(bottom);

  // style red suits
  if (card.suit === 'hearts' || card.suit === 'diamonds')
  {
    cardDesign.classList.add('red');
  }

  return cardDesign;
}

function renderDeck(deck, container)
{
  // Clear children in a safe manner to avoid injecting markup via innerHTML;
  if (typeof container.replaceChildren === 'function')
  {
    container.replaceChildren();
  }
  else
  {
    while (container.firstChild)
    {
      container.removeChild(container.firstChild);
    }
  }
  deck.forEach(cd =>
  {
    container.appendChild(renderCard(cd));
  });
}